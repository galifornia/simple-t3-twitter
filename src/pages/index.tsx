import { type NextPage } from "next";
import { useRouter } from "next/router";
import { z } from "zod";
import CreatePostWizard from "~/components/CreatePostWizard";
import Feed from "~/components/Feed";
import Layout from "~/components/Layout";
import { Skeleton } from "~/components/Skeleton";
import { api } from "~/utils/api";

import { useUser } from "@clerk/nextjs";

const Home: NextPage = () => {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const { page } = router.query;
  const parsed = z.number().safeParse(page ? +page : 0);
  const actualPage = parsed.success ? parsed.data : 0;

  // start fetching early
  api.posts.getAllPosts.useQuery({ page: actualPage });

  return (
    <Layout>
      {!isLoaded && <Skeleton className="h-36 w-full" />}
      {isSignedIn ? <CreatePostWizard page={actualPage} /> : null}
      <Feed page={actualPage} />
    </Layout>
  );
};

export default Home;
