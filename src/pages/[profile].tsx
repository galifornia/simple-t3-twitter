import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
} from "next";
import Head from "next/head";
import Image from "next/image";
import superson from "superjson";
import Layout from "~/components/Layout";
import { appRouter } from "~/server/api/root";
import { api } from "~/utils/api";

import { createProxySSGHelpers } from "@trpc/react-query/ssg";

import { prisma } from "../server/db";

const ProfilePage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { profile } = props;
  const { data } = api.profiles.getUserByUsername.useQuery(profile as string);

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>Chirp | {profile}</title>
      </Head>
      <Layout>
        <div className="relative flex h-24 items-center gap-8 border-b border-slate-400 p-4">
          <Image
            className="border-slate-9000 absolute -bottom-0 left-0 -mb-12 ml-4 rounded-full border-2 border-black"
            width={96}
            height={96}
            src={data.profilePictureUrl}
            alt={`profile picture of @${data.username}`}
          />
        </div>
        <div className="border-b border-slate-400 p-4">
          <div className="h-16"></div>
          <div className="text-2xl font-bold">@{data.username}</div>
        </div>
        <div className="h-screen"></div>
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: { prisma, userId: "" },
    transformer: superson,
  });

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
