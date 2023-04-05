import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
} from "next";
import Head from "next/head";
import superson from "superjson";
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
      <div>Profile of @{data.username}</div>
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
