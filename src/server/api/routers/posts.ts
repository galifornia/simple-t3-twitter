import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";

import { clerkClient } from "@clerk/nextjs/server";
import { Post } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { filterUserForClient } from "../../helpers/filterUserForClient";
import { protectedProcedure } from "../trpc";

// Create a new ratelimiter, that allows 3 requests per minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});

export const postsRouter = createTRPCRouter({
  getAllPosts: publicProcedure.query(async ({ input, ctx }) => {
    const posts: Post[] = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => {
          if (post.userId) return post.userId;
        }) as string[],
        limit: 100,
      })
    )
      .map(filterUserForClient)
      .filter(Boolean);

    return posts.map((post: Post) => {
      const author = users.find((user) => user.id === post.userId);
      if (!author)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Author for post not found",
        });

      return {
        post,
        author,
      };
    });
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
