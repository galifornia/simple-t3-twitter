import Link from "next/link";
import { AiOutlineGithub } from "react-icons/ai";

const Footer = () => {
  return (
    <footer className="my-4 flex h-10 w-full items-center justify-center gap-2 pb-20 pt-10">
      <span>Built by</span>
      <Link
        className="rounded-lg underline-offset-2 hover:underline"
        href="https://github.com/galifornia"
      >
        <div className="flex items-center gap-2">
          <AiOutlineGithub className="h-7 w-7" />
          <span>@galifornia</span>
        </div>
      </Link>
    </footer>
  );
};

export default Footer;
