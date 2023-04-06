import { clerkClient } from "@clerk/nextjs/server";
import type { Post } from "@prisma/client";
import { TRPCError } from "@trpc/server";

import { filterUserForClient } from "./filterUserForClient";

export const addAuthorToPosts = async (posts: Post[]) => {
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
};
