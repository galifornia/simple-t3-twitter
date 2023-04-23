import { z } from "zod";
import {
  MAXIMUM_NUMBER_OF_CHARACTERS,
  NUMBER_OF_POSTS_PER_PAGE,
} from "~/constants/constants";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
import { addAuthorToPosts } from "~/server/helpers/addAuthorToPosts";

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
  getAllPosts: publicProcedure
    .input(
      z.object({
        page: z.number(),
        userId: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const [posts, count] = await ctx.prisma.$transaction([
        ctx.prisma.post.findMany({
          take: NUMBER_OF_POSTS_PER_PAGE,
          skip: NUMBER_OF_POSTS_PER_PAGE * input.page,
          orderBy: { createdAt: "desc" },
          where: {
            ...(input.userId ? { userId: input.userId } : {}),
          },
        }),
        ctx.prisma.post.count({
          where: {
            ...(input.userId ? { userId: input.userId } : {}),
          },
        }),
      ]);

      const response = { data: await addAuthorToPosts(posts), count };

      return response;
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
      z
        .string()
        .min(1)
        .max(
          MAXIMUM_NUMBER_OF_CHARACTERS,
          "Too long. Must be 280 characters or less"
        )
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

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const { success: userIsAllowed } = await ratelimit.limit(userId);

      if (!userIsAllowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Rate limit has been reached.",
        });
      }

      const post = await ctx.prisma.post.findFirst({ where: { id: input } });

      if (post?.userId !== userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not allowed to delete posts that are not yours.",
        });
      }

      await ctx.prisma.post.delete({ where: { id: input } });
    }),

  update: protectedProcedure
    .input(z.object({ content: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { content, id } = input;
      await ctx.prisma.post.update({
        data: {
          content,
        },
        where: {
          id,
        },
      });
    }),
  checkPermissions: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const exists = await ctx.prisma.post.findFirst({
        where: { id: input, userId },
      });
      return !!exists;
    }),
});
