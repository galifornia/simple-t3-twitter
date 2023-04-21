import Link from "next/link";
import { AiOutlineGithub } from "react-icons/ai";

const Footer = () => {
  return (
    <footer className="flex h-10 w-full items-center justify-center gap-2 py-4 pb-20">
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
