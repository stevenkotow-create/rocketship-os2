export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-surface-3/60 ${className}`} />;
}

export function JobCardSkeleton() {
  return (
    <div className="card !mb-0 flex items-start justify-between gap-4">
      <div className="flex-1 space-y-2.5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
      <Skeleton className="h-8 w-24 shrink-0" />
    </div>
  );
}
