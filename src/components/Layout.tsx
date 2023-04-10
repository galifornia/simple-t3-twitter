import type { PropsWithChildren } from "react";

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col px-4 lg:px-0">
      {children}
    </main>
  );
};

export default Layout;
