import { User } from "@clerk/nextjs/dist/api";

export const filterUserForClient = (user: User) => {
  if (user.username) {
    return {
      id: user.id,
      username: user.username,
      profilePictureUrl: user.profileImageUrl,
    };
  }
};
