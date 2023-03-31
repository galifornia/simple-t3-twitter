import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";

import { TRPCError } from "@trpc/server";
import { Post } from "@prisma/client";

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
  getAllPosts: publicProcedure
    // .input(z.string())
    .query(async ({ input, ctx }) => {
      const posts: Post[] = await ctx.prisma.post.findMany({
        // where: { userId: input },
        take: 100,
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
});
