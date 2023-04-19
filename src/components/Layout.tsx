import type { PropsWithChildren } from "react";

import Nav from "./Nav";

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col px-4 lg:px-0">
      <Nav />
      {children}
    </main>
  );
};

export default Layout;
