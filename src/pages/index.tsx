import { useState } from "react";

import { type NextPage } from "next";
import Image from "next/image";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";
import Feed from "~/components/Feed";
import Layout from "~/components/Layout";
import LoadingSpinner from "~/components/LoadingSpinner";
import { MAXIMUM_NUMBER_OF_CHARACTERS } from "~/constants/constants";
import { api } from "~/utils/api";

import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Post } from "@prisma/client";

const validationSchema = z.object({
  post: z
    .string()
    .min(1, "Cannot be empty")
    .max(
      MAXIMUM_NUMBER_OF_CHARACTERS,
      `Post should be under ${MAXIMUM_NUMBER_OF_CHARACTERS} characters`
    ),
});

type ValidationSchema = z.infer<typeof validationSchema>;

const CreatePostWizard = ({ page = 0 }) => {
  const { user } = useUser();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<ValidationSchema> = (data) => {
    mutate(data.post);
    reset();
  };

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
      ctx.posts.getAllPosts.setData({ page }, [newPost, ...previousPosts]);

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
      ctx.posts.getAllPosts.setData({ page }, context?.previousPosts);
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
    <>
      <div className="flex items-center gap-4 border border-slate-400 px-4">
        <Image
          priority
          width={56}
          height={56}
          className="h-14 w-14 rounded-full"
          src={user.profileImageUrl}
          alt={`Profile image of @${user.username || ""}`}
        />

        <form
          className="flex w-full gap-4 bg-transparent outline-none"
          onSubmit={(e) => {
            e.preventDefault();
            void (async () => {
              await handleSubmit(onSubmit)();
            })();
          }}
        >
          <textarea
            rows={4}
            placeholder="Type something"
            aria-invalid={errors.post ? "true" : "false"}
            className="w-full bg-transparent py-4 outline-none placeholder:flex placeholder:leading-[6rem]"
            id="post"
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
      {errors.post && (
        <p role="alert" className="py-2 font-bold text-red-600">
          {errors.post.message}
        </p>
      )}
    </>
  );
};

const Home: NextPage = () => {
  const { isLoaded, isSignedIn } = useUser();
  const [page, setPage] = useState(0);

  // start fetching early
  api.posts.getAllPosts.useQuery({ page: 0 });
  const { data } = api.posts.getCount.useQuery();

  return (
    <Layout>
      <p className="text-3xl text-white">Bananas</p>
      {isLoaded && isSignedIn ? <CreatePostWizard page={page} /> : null}
      <Feed page={page} setPage={setPage} numPosts={data || 0} />
    </Layout>
  );
};

export default Home;
