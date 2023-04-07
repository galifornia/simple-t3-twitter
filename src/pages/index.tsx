import { useState } from "react";

import { type NextPage } from "next";
import Image from "next/image";
import { toast } from "react-hot-toast";
import Layout from "~/components/Layout";
import PostView from "~/components/PostView";
import { api } from "~/utils/api";

import { useUser } from "@clerk/nextjs";
import { Post } from "@prisma/client";

import LoadingSpinner from "../components/LoadingSpinner";

const CreatePostWizard = ({}) => {
  const { user } = useUser();
  const [userInput, setUserInput] = useState("");
  if (!user) return null;

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onMutate: async (post) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await ctx.posts.getAllPosts.cancel();

      // Snapshot the previous value
      const previousPosts = ctx.posts.getAllPosts.getData();

      if (!previousPosts) {
        return {};
      }

      const newPost: {
        post: Post;
        author: { id: string; username: string; profilePictureUrl: string };
      } = {
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
      };

      // Optimistically update to the new value
      ctx.posts.getAllPosts.setData(undefined, [newPost, ...previousPosts]);

      // Return a context object with the snapshotted value
      return { previousPosts };
    },
    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (e, _newPost, context) => {
      const errorMessage = e.data?.zodError?.formErrors;

      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to create post!! Please try again later.");
      }
      ctx.posts.getAllPosts.setData(undefined, context?.previousPosts);
    },
    onSuccess: () => {
      setUserInput("");
    },
    // Always refetch after error or success:
    onSettled: () => {
      void ctx.posts.getAllPosts.invalidate();
    },
  });

  const handleCreation = () => {
    mutate(userInput);
  };

  return (
    <div className="flex h-24 items-center gap-4 border-b border-slate-400 px-4">
      <Image
        width={56}
        height={56}
        className="h-14 w-14 rounded-full"
        src={user.profileImageUrl}
        alt={`Profile image of @${user.username || ""}`}
      />
      {/* FIXME: use react-hook-form */}
      <input
        type="text"
        placeholder="Type something"
        className="grow bg-transparent outline-none"
        value={userInput}
        onChange={(e) => setUserInput(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleCreation();
          }
        }}
        disabled={isPosting}
      />

      {userInput !== "" && !isPosting && (
        <button onClick={handleCreation}>Send</button>
      )}

      {isPosting && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={20} />
        </div>
      )}
    </div>
  );
};

const Feed = () => {
  const { data, isLoading } = api.posts.getAllPosts.useQuery();

  if (isLoading)
    return (
      <div className="flex h-[calc(100vh-100px)] w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  if (!data) return <div>Something went wrong fetching the data.</div>;

  return (
    <div className="flex w-full justify-center overflow-y-scroll">
      <div className="flex w-full flex-col gap-4 border-slate-400">
        {data.map((postWithAuthor) => (
          <PostView key={postWithAuthor.post.id} {...postWithAuthor} />
        ))}
      </div>
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded, isSignedIn } = useUser();

  // start fetching early
  api.posts.getAllPosts.useQuery();

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <Layout>
      <CreatePostWizard />
      <Feed />
    </Layout>
  );
};

export default Home;
