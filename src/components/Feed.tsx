import { NUMBER_OF_POSTS_PER_PAGE } from "~/constants/constants";
import { api } from "~/utils/api";

import LoadingSpinner from "./LoadingSpinner";
import PostView from "./PostView";

const Feed = ({
  page = 0,
  numPosts,
  userId,
  setPage,
}: {
  page: number;
  numPosts: number;
  userId?: string;
  setPage: (v: number) => void;
}) => {
  const { data, isLoading } = api.posts.getAllPosts.useQuery({ page, userId });

  if (isLoading)
    return (
      <div className="flex h-[calc(100vh-100px)] w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  if (!data) return <div>Something went wrong fetching the data.</div>;

  return (
    <div className="my-4 flex w-full flex-col justify-center overflow-y-scroll">
      <div className="flex w-full flex-col gap-4 border border-slate-400">
        {data.map((postWithAuthor) => (
          <PostView key={postWithAuthor.post.id} {...postWithAuthor} />
        ))}
      </div>

      <div className="mx-auto flex gap-4 py-10">
        {page > 0 && (
          <button
            className="w-32 rounded-xl border border-zinc-400 bg-transparent p-2 text-xl hover:border-zinc-200 hover:underline"
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
        )}
        {(page + 1) * NUMBER_OF_POSTS_PER_PAGE < numPosts && (
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

export default Feed;
