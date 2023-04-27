import Link from "next/link";

import { Button } from "./Button";
import ChirpLogo from "./ChirpLogo";
import Layout from "./Layout";

const Custom404 = () => {
  return (
    <Layout>
      <div className="flex h-[70svh] flex-col items-center justify-center">
        <ChirpLogo
          className="h-40 w-40 bg-transparent fill-red-400"
          bgColor="transparent"
        />
        <div className="-mt-4">
          <h1 className="text-center text-5xl">404</h1>
          <div className="my-4 flex flex-col gap-4">
            <p className="text-center text-2xl">
              Not all those who wander are lost... except in your case.
            </p>
            <Link className="flex items-center justify-center" href="/">
              <Button className="text-xl" size="lg" variant="secondary">
                Go back home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Custom404;
