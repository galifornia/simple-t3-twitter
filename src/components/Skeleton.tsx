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
  <div className="flex items-center space-x-4">
    <Skeleton className="h-12 w-12 rounded-full" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
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
