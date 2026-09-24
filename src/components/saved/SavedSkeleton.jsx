import { SkeletonBlock } from '../common/StatusBlocks.jsx'

export function SavedSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-3xl bg-rw-surface shadow-sm"
        >
          <SkeletonBlock className="h-48 w-full rounded-none" />
          <div className="space-y-3 p-4">
            <SkeletonBlock className="h-5 w-2/3" />
            <SkeletonBlock className="h-4 w-1/2" />
            <SkeletonBlock className="h-4 w-24 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
