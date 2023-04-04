import { filterUserForClient } from "./../../helpers/filterUserForClient";
import { z } from "zod";
import { publicProcedure } from "~/server/api/trpc";

import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter } from "../trpc";
import { User } from "@clerk/nextjs/dist/api";

export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const u = await clerkClient.users.getUserList({
        username: [input.slice(1)],
      });

      if (!u || !u[0]) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }

      const user = u[0];
      return filterUserForClient(user);
    }),
});
