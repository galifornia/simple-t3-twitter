import { useState } from "react";

import { type NextPage } from "next";
import Image from "next/image";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import Layout from "~/components/Layout";
import PostView from "~/components/PostView";
import { NUMBER_OF_POSTS_PER_PAGE } from "~/constants/constants";
import { api } from "~/utils/api";

import { useUser } from "@clerk/nextjs";
import type { Post } from "@prisma/client";

import LoadingSpinner from "../components/LoadingSpinner";

type Inputs = {
  post: string;
};

const CreatePostWizard = ({ page = 0 }) => {
  const { user } = useUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: {},
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    mutate(data.post);
    reset();
  };

  // const [userInput, setUserInput] = useState("");
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
      ctx.posts.getAllPosts.setData(page, [newPost, ...previousPosts]);

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
      ctx.posts.getAllPosts.setData(page, context?.previousPosts);
    },
    onSuccess: () => {
      reset();
    },
    // Always refetch after error or success:
    onSettled: () => {
      void ctx.posts.getAllPosts.invalidate();
    },
  });

  return (
    <div className="flex h-24 items-center gap-4 border-b border-slate-400 px-4">
      <Image
        width={56}
        height={56}
        className="h-14 w-14 rounded-full"
        src={user.profileImageUrl}
        alt={`Profile image of @${user.username || ""}`}
      />

      <form
        className="flex w-full bg-transparent outline-none"
        onSubmit={() => void handleSubmit(onSubmit)}
      >
        <input
          type="text"
          placeholder="Type something"
          className="w-full grow bg-transparent outline-none"
          {...register("post")}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void (async () => {
                await handleSubmit(onSubmit)();
              })();
            }
          }}
          disabled={isPosting}
        />

        {!isPosting && <button type="submit">Send</button>}

        {isPosting && (
          <div className="flex items-center justify-center">
            <LoadingSpinner size={20} />
          </div>
        )}
      </form>
    </div>
  );
};

const Feed = ({
  page = 0,
  numPosts,
  setPage,
}: {
  page: number;
  numPosts: number;
  setPage: (v: number) => void;
}) => {
  const { data, isLoading } = api.posts.getAllPosts.useQuery(page);

  if (isLoading)
    return (
      <div className="flex h-[calc(100vh-100px)] w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  if (!data) return <div>Something went wrong fetching the data.</div>;

  return (
    <div className="flex w-full flex-col justify-center overflow-y-scroll">
      <div className="flex w-full flex-col gap-4 border-slate-400">
        {data.map((postWithAuthor) => (
          <PostView key={postWithAuthor.post.id} {...postWithAuthor} />
        ))}
      </div>
      <div className="mx-auto my-4 flex gap-4">
        {page > 0 && (
          <button
            className="w-32 rounded-xl border border-zinc-400 bg-transparent p-2 text-xl hover:border-zinc-200 hover:underline"
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
        )}
        {(page + 1) * NUMBER_OF_POSTS_PER_PAGE <= numPosts && (
          <button
            className="w-32 rounded-xl border border-zinc-400 bg-transparent p-2 text-xl hover:border-zinc-200 hover:underline"
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

const Home: NextPage = () => {
  const { isLoaded, isSignedIn } = useUser();
  const [page, setPage] = useState(0);

  // start fetching early
  api.posts.getAllPosts.useQuery(0);
  const { data } = api.posts.getCount.useQuery();

  if (!isLoaded || !isSignedIn) {
    return null;
  }

  return (
    <Layout>
      <CreatePostWizard page={page} />
      <Feed page={page} setPage={setPage} numPosts={data || 0} />
    </Layout>
  );
};

export default Home;
