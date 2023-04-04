import Head from "next/head";
import { useRouter } from "next/router";
import LoadingSpinner from "~/components/LoadingSpinner";
import { api } from "~/utils/api";

const ProfilePage = () => {
  const router = useRouter();
  const { profile } = router.query;
  const { data, isLoading } = api.profiles.getUserByUsername.useQuery(
    profile as string
  );

  if (isLoading) return <LoadingSpinner size={64} />;

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>Chirp | Profile</title>
      </Head>
      <div>Profile of @{data.username}</div>
    </>
  );
};

export default ProfilePage;
