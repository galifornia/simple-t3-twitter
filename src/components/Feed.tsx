import { NUMBER_OF_POSTS_PER_PAGE } from "~/constants/constants";
import { scrollToTop } from "~/lib/utils";
import { api } from "~/utils/api";

import { Button } from "./Button";
import PostView from "./PostView";
import { PostSkeleton } from "./Skeleton";

const Feed = ({
  page = 0,
  userId,
  setPage,
}: {
  page: number;
  userId?: string;
  setPage: (v: number) => void;
}) => {
  const { data, isLoading } = api.posts.getAllPosts.useQuery({ page, userId });

  if (isLoading)
    return (
      <div className="flex w-full flex-col items-center justify-center gap-4">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  if (!data) return <div>Something went wrong fetching the data.</div>;

  return (
    <div className="my-4 flex w-full flex-col justify-center gap-4 overflow-y-scroll">
      <div className="flex w-full flex-col gap-4">
        {data.data.map((postWithAuthor) => (
          <PostView key={postWithAuthor.post.id} {...postWithAuthor} />
        ))}
      </div>

      <div className="mx-auto flex gap-4">
        {page > 0 && (
          <Button
            size="lg"
            variant={"outline"}
            onClick={() => {
              setPage(page - 1);
              scrollToTop();
            }}
          >
            Previous
          </Button>
        )}
        {(page + 1) * NUMBER_OF_POSTS_PER_PAGE < data.count && (
          <Button
            size="lg"
            variant={"outline"}
            onClick={() => {
              setPage(page + 1);
              scrollToTop();
            }}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

export default Feed;
