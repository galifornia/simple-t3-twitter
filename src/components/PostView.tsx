import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";
import { RouterOutputs } from "~/utils/api";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAllPosts"][number];
export const PostView = ({ post, author }: PostWithUser) => {
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

export default PostView;
