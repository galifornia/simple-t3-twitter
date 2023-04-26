import { Layout } from "lucide-react";
import Head from "next/head";
import Link from "next/link";
import ChirpLogo from "~/components/ChirpLogo";

const ErrorPage = () => {
  return (
    <>
      <Head>
        <title>Chirp | 404</title>
      </Head>
      <Layout>
        <ChirpLogo className="h-32 w-32" />
        <Link href="/">
          <h1 className="text-3xl">All paths lead to Home</h1>
        </Link>
      </Layout>
    </>
  );
};

export default ErrorPage;
