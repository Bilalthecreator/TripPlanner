import { SkeletonBlock } from '../common/StatusBlocks.jsx'

export function SettingsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <div className="space-y-2">
        {Array.from({ length: 5 }, (_, i) => (
          <SkeletonBlock key={i} className="h-10 w-full rounded-xl" />
        ))}
      </div>
      <div className="space-y-4">
        <SkeletonBlock className="h-40 w-full rounded-3xl" />
        <SkeletonBlock className="h-56 w-full rounded-3xl" />
        <SkeletonBlock className="h-64 w-full rounded-3xl" />
      </div>
    </div>
  )
}
