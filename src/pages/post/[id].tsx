import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
} from "next";
import Head from "next/head";
import { generateSSGHelper } from "~/server/helpers/ssg";
import { api } from "~/utils/api";

const PostPage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const postId = props.id;
  const { data, isLoading } = api.posts.getPostByPostId.useQuery(postId);

  return (
    <>
      <Head>
        <title>Chirp | PostView</title>
      </Head>
      <div>{data?.content}</div>
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
