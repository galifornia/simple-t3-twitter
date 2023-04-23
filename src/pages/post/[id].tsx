import { useState } from "react";

import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
} from "next";
import { Indie_Flower } from "next/font/google";
import Head from "next/head";
import { useRouter } from "next/router";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/AlertDialog";
import { Button } from "~/components/Button";
import Layout from "~/components/Layout";
import LoadingSpinner from "~/components/LoadingSpinner";
import PostView from "~/components/PostView";
import { PostSkeleton } from "~/components/Skeleton";
import { MAXIMUM_NUMBER_OF_CHARACTERS } from "~/constants/constants";
import { generateSSGHelper } from "~/server/helpers/ssg";
import { api } from "~/utils/api";

import { zodResolver } from "@hookform/resolvers/zod";

const indie = Indie_Flower({
  weight: "400",
  subsets: ["latin"],
});

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

type PostFormProps = {
  setIsEditing: (v: boolean) => void;
  id: string;
  refetchPost: () => void;
  content: string;
};
const PostForm = ({
  id,
  content,
  refetchPost,
  setIsEditing,
}: PostFormProps) => {
  const { mutate, isLoading: isPosting } = api.posts.update.useMutation({
    onSuccess: () => {
      refetchPost();
      setIsEditing(false);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ValidationSchema>({
    defaultValues: { post: content },
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<ValidationSchema> = (data) => {
    mutate({ id, content: data.post });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <form
        className="flex w-full items-center gap-4 rounded-xl border bg-transparent p-4 outline-none"
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
            className="rounded-xl border border-slate-100 text-lg hover:bg-transparent hover:text-slate-100"
            variant="ghost"
            type="submit"
          >
            Update
          </Button>
        )}

        {isPosting && (
          <div className="flex items-center justify-center">
            <LoadingSpinner size={20} />
          </div>
        )}
      </form>
      <Button variant="outline" onClick={() => setIsEditing(false)}>
        Cancel edit
      </Button>
    </div>
  );
};

const PostPage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const postId = props.id as string;
  const [isEditing, setIsEditing] = useState(false);

  const {
    data,
    isLoading: loadingPost,
    refetch: refetchPost,
  } = api.posts.getPostByPostId.useQuery(postId);
  const router = useRouter();
  const { mutate: deletePost } = api.posts.delete.useMutation({
    onSuccess: () => {
      // !FIXME: go back to the right page
      void router.push("/");
    },
  });

  const { data: hasPermission, isLoading: checkingPermissions } =
    api.posts.checkPermissions.useQuery(postId);

  if (!data) return <div>404</div>;

  if (loadingPost || checkingPermissions)
    return (
      <Layout>
        <PostSkeleton />
      </Layout>
    );

  return (
    <>
      <Head>
        <title>
          Chirp | {`${data.post.content} | @${data.author.username}`}
        </title>
      </Head>
      <Layout>
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <div className="w-full">
            {isEditing ? (
              <PostForm
                id={data.post.id}
                refetchPost={() =>
                  void (async () => {
                    await refetchPost();
                  })()
                }
                content={data.post.content}
                setIsEditing={setIsEditing}
              />
            ) : (
              <PostView {...data} />
            )}
          </div>
          {hasPermission && !isEditing ? (
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setIsEditing((state) => !state)}
              >
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent
                  className={`${indie.className} border-2 border-red-500`}
                >
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold underline underline-offset-4">
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      this post.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() => deletePost(postId)}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : null}
        </div>
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const id = context.params?.id as string;

  await ssg.posts.getPostByPostId.prefetch(id);

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default PostPage;
