import Link from "next/link";

import {
  SignInButton,
  SignOutButton,
  SignUpButton,
  useUser,
} from "@clerk/nextjs";

import { Button } from "./Button";

const Nav = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null;

  return (
    <nav className="flex items-center justify-between py-4">
      <Link href="/">
        <h1 className="text-3xl font-bold tracking-wider">Chirp</h1>
      </Link>

      {!user ? (
        <div className="flex gap-4">
          <Button size="lg">
            <SignInButton />
          </Button>

          <Button variant="outline" size="lg">
            <SignUpButton />
          </Button>
        </div>
      ) : (
        <Button size="lg">
          <SignOutButton />
        </Button>
      )}
    </nav>
  );
};

export default Nav;
