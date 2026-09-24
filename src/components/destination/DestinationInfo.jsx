import { SkeletonBlock } from '../common/StatusBlocks.jsx'
import { IconChart, IconLeafSmall, IconStar } from '../common/Icons.jsx'

export function DestinationInfo({ destination, status }) {
  if (status === 'loading' || !destination) {
    return (
      <div className="flex flex-col gap-4 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <SkeletonBlock className="h-14 w-72" />
          <SkeletonBlock className="h-12 w-full max-w-xl" />
        </div>
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="h-8 w-48 rounded-full" />
          <SkeletonBlock className="h-8 w-56 rounded-full" />
          <SkeletonBlock className="h-8 w-40 rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 pb-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="max-w-3xl space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-4xl font-bold tracking-[-1.2px] text-rw-ink sm:text-[56px] sm:leading-16 sm:tracking-[-1.68px]">
            {destination.name}, {destination.country}
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rw-surface-muted px-2 py-1 text-[13px] font-semibold tracking-[0.26px] text-rw-ink">
            <span aria-hidden="true">{destination.flag}</span>
            {destination.countryCode}
          </span>
        </div>
        <p className="text-base leading-[26px] text-rw-muted">{destination.description}</p>
      </div>

      <div className="flex flex-wrap gap-2 lg:w-[320px] lg:flex-col xl:w-[420px]">
        <span className="inline-flex items-center gap-1 rounded-full bg-rw-surface-soft px-4 py-1 shadow-sm">
          <IconStar className="text-rw-accent" />
          <span className="font-display text-lg font-semibold tracking-[-0.18px] text-rw-ink">
            {destination.rating}
          </span>
          <span className="text-xs tracking-[0.12px] text-rw-muted">
            ({destination.reviewCount} reviews)
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rw-warm px-4 py-1 shadow-sm">
          <IconLeafSmall className="text-rw-muted" />
          <span className="text-[13px] font-semibold tracking-[0.26px] text-rw-muted">Best:</span>
          <span className="text-[13px] font-semibold tracking-[0.26px] text-rw-ink">
            {destination.bestSeason}
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e2e7ff] px-4 py-1 shadow-sm dark:bg-rw-surface-muted">
          <IconChart className="text-rw-muted" />
          <span className="text-[13px] font-semibold tracking-[0.26px] text-rw-muted">Avg:</span>
          <span className="font-display text-lg font-semibold tracking-[0.26px] text-rw-accent">
            ${destination.dailyAvg}
          </span>
          <span className="text-[13px] font-semibold tracking-[0.26px] text-rw-muted">/ day</span>
        </span>
      </div>
    </div>
  )
}
