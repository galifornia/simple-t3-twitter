import superjson from "superjson";
import { prisma } from "~/server/db";

import { createProxySSGHelpers } from "@trpc/react-query/ssg";

import { appRouter } from "../api/root";

export const generateSSGHelper = () => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: "" },
    transformer: superjson,
  });

  return ssg;
};
