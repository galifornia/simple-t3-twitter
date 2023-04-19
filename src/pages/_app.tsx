import "~/styles/globals.css";

import { type AppType } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { Toaster } from "react-hot-toast";
import { api } from "~/utils/api";

import {
  ClerkProvider,
  RedirectToSignIn,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";

const publicPages = ["/sign-in/[[...index]]", "/sign-up/[[...index]]", "/"];

const MyApp: AppType = ({ Component, pageProps }) => {
  const { pathname } = useRouter();

  // Check if the current route matches a public page
  const isPublicPage = publicPages.includes(pathname);
  return (
    <ClerkProvider {...pageProps}>
      <Head>
        <title>Chirp</title>
        <meta name="description" content="Chirp t3 app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Toaster />
      {isPublicPage ? (
        <Component {...pageProps} />
      ) : (
        <>
          <SignedIn>
            <Component {...pageProps} />
          </SignedIn>

          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </>
      )}
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
