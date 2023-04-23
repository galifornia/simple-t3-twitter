import { useState } from "react";

import { type NextPage } from "next";
import Image from "next/image";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { Button } from "~/components/Button";
import { Card } from "~/components/Card";
import Feed from "~/components/Feed";
import Layout from "~/components/Layout";
import LoadingSpinner from "~/components/LoadingSpinner";
import { Skeleton } from "~/components/Skeleton";
import {
  MAXIMUM_NUMBER_OF_CHARACTERS,
  NUMBER_OF_POSTS_PER_PAGE,
} from "~/constants/constants";
import { generatePost } from "~/lib/utils";
import { api } from "~/utils/api";

import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";

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
      const previousData = ctx.posts.getAllPosts.getData({ page });

      if (!previousData) {
        return {};
      }

      // Generate provisional post with fake id
      const newPost = generatePost(user, post);

      // Optimistically update to the new value
      ctx.posts.getAllPosts.setData(
        { page },
        {
          data: [newPost, ...previousData.data].slice(
            0,
            NUMBER_OF_POSTS_PER_PAGE
          ),
          count: previousData.count,
        }
      );

      // Return a context object with the snapshotted value
      return { previousData };
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
      ctx.posts.getAllPosts.setData({ page }, context?.previousData);
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
    <Card className="bg-transparent text-slate-100">
      <div className="flex items-center gap-4 px-4">
        <Image
          priority
          width={56}
          height={56}
          className="h-14 w-14 rounded-full"
          src={user.profileImageUrl}
          alt={`Profile image of @${user.username || ""}`}
        />

        <form
          className="flex w-full items-center gap-4 bg-transparent outline-none"
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
            className="w-full resize-none bg-transparent py-4 outline-none [-ms-overflow-style:'none'] [scrollbar-width:'none'] placeholder:flex placeholder:leading-[7rem] [&::-webkit-scrollbar]:hidden"
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

          {!isPosting && (
            <Button
              className="rounded-xl border border-transparent text-lg hover:border-slate-100 hover:bg-transparent hover:text-slate-100"
              variant="ghost"
              type="submit"
            >
              Send
            </Button>
          )}

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
    </Card>
  );
};

const Home: NextPage = () => {
  const { isLoaded, isSignedIn } = useUser();
  const [page, setPage] = useState(0);

  // start fetching early
  api.posts.getAllPosts.useQuery({ page: 0 });

  return (
    <Layout>
      {!isLoaded && <Skeleton className="h-36 w-full" />}
      {isSignedIn ? <CreatePostWizard page={page} /> : null}
      <Feed page={page} setPage={setPage} />
    </Layout>
  );
};

export default Home;
