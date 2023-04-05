import { useState } from "react";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { type NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  api,
  RouterOutputs,
} from "~/utils/api";

import { useUser } from "@clerk/nextjs";

import LoadingSpinner from "../components/LoadingSpinner";

dayjs.extend(relativeTime);

const CreatePostWizard = ({}) => {
  const { user } = useUser();
  const [userInput, setUserInput] = useState("");
  if (!user) return null;

  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      setUserInput("");
      // !FIXME: replace with optimistic update behavior
      void ctx.posts.getAllPosts.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.data?.zodError?.formErrors;

      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to create post!! Please try again later.");
      }
    },
  });

  const handleCreation = () => {
    mutate(userInput);
  };

  return (
    <div className="flex gap-4">
      <Image
        width={56}
        height={56}
        className="h-14 w-14 rounded-full"
        src={user.profileImageUrl}
        alt={`Profile image of @${user.username!}`}
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

type PostWithUser = RouterOutputs["posts"]["getAllPosts"][number];
const PostView = ({ post, author }: PostWithUser) => {
  return (
    <div className="flex gap-4 border-b border-slate-400 p-4" key={post.id}>
      <Image
        width={56}
        height={56}
        className="h-14 w-14 rounded-full"
        src={author?.profilePictureUrl}
        alt={`Profile of @${author?.username}`}
      />

      <div className="flex flex-col">
        <div className="flex gap-2 text-slate-400">
          <Link href={`/@${author.username}`}>
            <h5 className="">@{author.username}</h5>
          </Link>
          <Link href={`/post/${post.id}`}>
            <span className="">·</span>
            <span>{`${dayjs(post.createdAt).fromNow()}`}</span>
          </Link>
        </div>

        <p className="text-xl">{post.content}</p>
      </div>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading } = api.posts.getAllPosts.useQuery();

  if (isLoading)
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  if (!data) return <div>Something went wrong fetching the data.</div>;

  return (
    <div className="flex h-screen w-full justify-center">
      <div className="flex w-full flex-col gap-4 border-x border-slate-400">
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
    <>
      <main className="mx-auto flex w-full max-w-3xl flex-col justify-center">
        <div className="w-full border border-slate-400 p-4">
          <CreatePostWizard />
        </div>
        <Feed />
      </main>
    </>
  );
};

export default Home;
