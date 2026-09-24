import { SkeletonBlock } from '../common/StatusBlocks.jsx'

export function TripCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-rw-surface shadow-sm">
      <SkeletonBlock className="h-52 w-full rounded-none sm:h-56" />
      <div className="space-y-3 p-4">
        <SkeletonBlock className="h-3 w-28" />
        <SkeletonBlock className="h-2 w-full rounded-full" />
        <SkeletonBlock className="h-3 w-3/4" />
        <div className="flex gap-2 pt-1">
          <SkeletonBlock className="h-6 w-36 rounded-full" />
          <SkeletonBlock className="h-6 w-28 rounded-full" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex -space-x-2">
            <SkeletonBlock className="size-7 rounded-full" />
            <SkeletonBlock className="size-7 rounded-full" />
            <SkeletonBlock className="size-7 rounded-full" />
          </div>
          <SkeletonBlock className="h-9 w-36 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function TripsSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {Array.from({ length: count }, (_, i) => (
        <TripCardSkeleton key={i} />
      ))}
    </div>
  )
}
