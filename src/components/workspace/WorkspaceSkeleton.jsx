import { SkeletonBlock } from '../common/StatusBlocks.jsx'

export function WorkspaceSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-3">
        <SkeletonBlock className="h-3 w-40" />
        <SkeletonBlock className="h-9 w-72 max-w-full" />
        <SkeletonBlock className="h-4 w-64 max-w-full" />
        <div className="flex gap-2">
          <SkeletonBlock className="h-9 w-32 rounded-full" />
          <SkeletonBlock className="h-9 w-36 rounded-full" />
          <SkeletonBlock className="h-9 w-28 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="space-y-3 rounded-2xl bg-rw-surface p-4">
            <SkeletonBlock className="h-3 w-24" />
            <SkeletonBlock className="h-8 w-20" />
            <SkeletonBlock className="h-4 w-full" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-2 rounded-3xl bg-rw-surface p-4">
          <SkeletonBlock className="h-6 w-32" />
          {Array.from({ length: 5 }, (_, i) => (
            <SkeletonBlock key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
        <div className="space-y-4 rounded-3xl bg-rw-surface p-5">
          <SkeletonBlock className="h-8 w-56" />
          <SkeletonBlock className="h-28 w-full rounded-2xl" />
          <SkeletonBlock className="h-28 w-full rounded-2xl" />
          <SkeletonBlock className="h-28 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
