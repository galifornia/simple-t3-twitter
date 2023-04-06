import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { addAuthorToPosts } from "~/server/helpers/addAuthorToPosts";

import { Post } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { protectedProcedure } from "../trpc";

// Create a new ratelimiter, that allows 3 requests per minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});

export const postsRouter = createTRPCRouter({
  getAllPosts: publicProcedure.query(async ({ ctx }) => {
    const posts: Post[] = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
    });

    return await addAuthorToPosts(posts);
  }),

  getPostsByUserId: publicProcedure
    .input(z.string().min(1))
    .query(async ({ input, ctx }) => {
      const posts: Post[] = await ctx.prisma.post.findMany({
        take: 100,
        orderBy: { createdAt: "desc" },
        where: {
          userId: input,
        },
      });

      return await addAuthorToPosts(posts);
    }),
  getPostByPostId: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const post = await ctx.prisma.post.findFirst({
        where: { id: input },
      });

      if (!post) {
        new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Cannot find post by this id",
        });
        return null;
      }

      const postWithAuthor = (await addAuthorToPosts([post]))[0];
      return postWithAuthor;
    }),

  create: protectedProcedure
    .input(
      z.string().min(1).max(280, "Too long. Must be 280 characters or less")
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const { success: userIsAllowed } = await ratelimit.limit(userId);

      if (!userIsAllowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Rate limit has been reached.",
        });
      }

      const post = await ctx.prisma.post.create({
        data: {
          userId,
          content: input,
        },
      });

      return post;
    }),
});
