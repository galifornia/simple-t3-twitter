import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { UserResource } from "@clerk/types";

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const generatePost = (user: UserResource, post: string) => ({
  post: {
    userId: user.id,
    id: `fake-${Math.random() * 100}`,
    content: post,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  author: {
    id: user.id,
    username: user.username || "",
    profilePictureUrl: user.profileImageUrl,
  },
});

const isBrowser = () => typeof window !== "undefined"; //The approach recommended by Next.js

export const scrollToTop = () => {
  if (!isBrowser()) return;
  window.scrollTo({ top: 0, behavior: "smooth" });
};
