import { useState } from "react";

import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
} from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Feed from "~/components/Feed";
import Layout from "~/components/Layout";
import { generateSSGHelper } from "~/server/helpers/ssg";
import { api } from "~/utils/api";

const ProfilePage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { profile } = props;
  const { data: user } = api.profiles.getUserByUsername.useQuery(
    profile as string
  );
  api.posts.getAllPosts.useQuery({ page: 0, userId: user?.id });

  const [page, setPage] = useState(0);

  if (!user) return <div>404</div>;

  return (
    <>
      <Head>
        <title>Chirp | {profile}</title>
      </Head>
      <Layout>
        <Link href="/">
          <div className="relative flex h-24 items-center gap-8 rounded-tl-lg rounded-tr-lg border border-slate-100 p-4">
            <Image
              className="border-slate-9000 absolute -bottom-0 left-0 -mb-12 ml-4 rounded-full border-2 border-black"
              width={96}
              height={96}
              src={user?.profilePictureUrl}
              alt={`profile picture of @${user?.username}`}
            />
          </div>
        </Link>

        <div className="rounded-bl-lg rounded-br-lg border border-t-0 border-slate-100 p-4">
          <div className="h-16"></div>
          <div className="text-2xl font-bold">@{user?.username}</div>
        </div>

        <Feed page={page} setPage={setPage} userId={user?.id} />
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();

  const profile = context.params?.profile as string;

  await ssg.profiles.getUserByUsername.prefetch(profile);

  return {
    props: {
      trpcState: ssg.dehydrate(),
      profile,
    },
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default ProfilePage;
