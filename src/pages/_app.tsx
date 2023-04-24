import "~/styles/globals.css";

import { type AppType } from "next/app";
import { Indie_Flower } from "next/font/google";
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

const indie = Indie_Flower({
  weight: "400",
  subsets: ["latin"],
});

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
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <Toaster />

      {isPublicPage ? (
        <main className={indie.className}>
          <Component {...pageProps} />
        </main>
      ) : (
        <>
          <SignedIn>
            <main className={indie.className}>
              <Component {...pageProps} />
            </main>
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
