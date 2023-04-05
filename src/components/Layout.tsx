import type { PropsWithChildren } from "react";

const Layout = ({ children }: PropsWithChildren) => {
  return (
    <main className="mx-auto flex max-h-screen w-full max-w-3xl flex-col border-x border-slate-400">
      {children}
    </main>
  );
};

export default Layout;
