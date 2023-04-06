import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
} from "next";
import Head from "next/head";
import Layout from "~/components/Layout";
import LoadingSpinner from "~/components/LoadingSpinner";
import PostView from "~/components/PostView";
import { generateSSGHelper } from "~/server/helpers/ssg";
import { api } from "~/utils/api";

const PostPage = (props: InferGetStaticPropsType<typeof getStaticProps>) => {
  const postId = props.id;

  const { data, isLoading } = api.posts.getPostByPostId.useQuery(postId);

  if (!data) return <div>404</div>;

  if (isLoading) return <LoadingSpinner size={48} />;

  return (
    <>
      <Head>
        <title>
          Chirp | {`${data.post.content} | @${data.author.username}`}
        </title>
      </Head>
      <Layout>
        <PostView {...data} />
      </Layout>
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
