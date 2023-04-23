import Link from "next/link";

import {
  SignInButton,
  SignOutButton,
  SignUpButton,
  useUser,
} from "@clerk/nextjs";

import { Button } from "./Button";
import { NavSkeleton } from "./Skeleton";

const Nav = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <NavSkeleton />;

  return (
    <nav className="flex items-center justify-between py-4">
      <Link href="/">
        <h1 className="text-3xl font-bold tracking-wider">Chirp</h1>
      </Link>

      {!user ? (
        <div className="flex gap-4">
          <Button>
            <SignInButton />
          </Button>

          <Button variant="outline">
            <SignUpButton />
          </Button>
        </div>
      ) : (
        <Button>
          <SignOutButton />
        </Button>
      )}
    </nav>
  );
};

export default Nav;
