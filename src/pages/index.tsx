import { type NextPage } from "next";
import Head from "next/head";

import { api, RouterOutputs } from "~/utils/api";
import LoadingSpinner from "../components/LoadingSpinner";

import { useUser } from "@clerk/nextjs";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";

dayjs.extend(relativeTime);

const CreatePostWizard = ({}) => {
  const { user } = useUser();
  if (!user) return null;

  return (
    <div className="flex gap-4">
      <Image
        width={56}
        height={56}
        className="h-14 w-14 rounded-full"
        src={user.profileImageUrl}
        alt={`Profile image of @${user.username!}`}
      />
      <input
        type="text"
        placeholder="Type something"
        className="grow bg-transparent outline-none"
      />
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
          <h5 className="">@{author.username}</h5>
          <span className="">·</span>
          <span>{`${dayjs(post.createdAt).fromNow()}`}</span>
        </div>

        <p>{post.content}</p>
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
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
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
