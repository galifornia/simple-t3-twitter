import { cn } from "~/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export const PostSkeleton = () => (
  <div className="my-4 flex w-full items-center gap-4">
    <Skeleton className="h-14 w-14 rounded-full" />
    <div className="w-full space-y-2">
      <Skeleton className="h-10 w-[90%]" />
      <Skeleton className="h-10 w-[80%]" />
    </div>
  </div>
);

export const NavSkeleton = () => (
  <div className="flex h-[72px] items-center justify-between">
    <Skeleton className="h-10 w-20" />
    <div className="flex gap-4">
      <Skeleton className="h-10 w-20" />
    </div>
  </div>
);

export { Skeleton };
