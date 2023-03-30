import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const postsRouter = createTRPCRouter({
  getAllPosts: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.post.findMany();
  }),
});
