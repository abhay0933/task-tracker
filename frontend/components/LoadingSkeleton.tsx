export default function LoadingSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card px-4 py-3 flex items-center gap-3 animate-pulse">
          <div className="w-4 h-4 rounded-full bg-[#e8e8e8] dark:bg-[#222] shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 bg-[#e8e8e8] dark:bg-[#222] rounded w-1/3" />
            <div className="h-2.5 bg-[#f0f0f0] dark:bg-[#1a1a1a] rounded w-1/2" />
          </div>
          <div className="hidden sm:block h-2.5 w-12 bg-[#f0f0f0] dark:bg-[#1a1a1a] rounded" />
        </div>
      ))}
    </div>
  );
}
