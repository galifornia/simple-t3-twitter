import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";
import type { RouterOutputs } from "~/utils/api";

import { Card } from "./Card";

dayjs.extend(relativeTime);

type PostWithUser = RouterOutputs["posts"]["getAllPosts"][number];
export const PostView = ({ post, author }: PostWithUser) => {
  return (
    <Card className="bg-transparent px-4 text-slate-100" key={post.id}>
      <div className="flex gap-4 py-4">
        <Image
          priority
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
          <Link href={`/post/${post.id}`}>
            <p className="overflow-anywhere text-xl">{post.content}</p>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default PostView;
