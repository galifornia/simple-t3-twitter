import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { Post } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { protectedProcedure } from "../trpc";

const filterUserForClient = (user: User) => {
  if (user.username) {
    return {
      id: user.id,
      username: user.username,
      profilePictureUrl: user.profileImageUrl,
    };
  }
};

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
    .input(z.string().min(1).max(280))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const post = await ctx.prisma.post.create({
        data: {
          userId,
          content: input,
        },
      });

      return post;
    }),
});
