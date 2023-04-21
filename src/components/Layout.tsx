import type { PropsWithChildren } from "react";

import Footer from "./Footer";
import Nav from "./Nav";

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col px-4 lg:px-0">
      <Nav />
      {children}
      <Footer />
    </main>
  );
};

export default Layout;
