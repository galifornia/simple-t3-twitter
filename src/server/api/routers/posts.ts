import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";

import { Post } from "../../../../node_modules/.prisma/client/index.d";

const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profilePictureUrl: user.profileImageUrl,
  };
};

export const postsRouter = createTRPCRouter({
  getAllPosts: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const posts = await ctx.prisma.post.findMany({
        where: { userId: input },
        take: 100,
      });

      const users = (
        await clerkClient.users.getUserList({
          userId: posts.map((post) => {
            if (post.userId) return post.userId;
          }) as string[],
          limit: 100,
        })
      ).map(filterUserForClient);

      return posts.map((post: Post) => ({
        post,
        author: users.find((user) => user.id === post.id),
      }));
    }),
});
