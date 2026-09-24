import { cn } from '../../utils/cn.js'
import { IconCamera, IconStar } from '../common/Icons.jsx'

export function TripProgress({ trip, progress }) {
  if (progress.mode === 'completed') {
    const rating = Number(trip.rating) || 0
    const memories = Number(trip.memoryCount) || 0

    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-0.5 text-amber-400" aria-label={`${rating} of 5 stars`}>
            {Array.from({ length: 5 }, (_, i) => (
              <IconStar
                key={i}
                className={cn(
                  'size-[12px]',
                  i < rating ? 'text-amber-400' : 'text-rw-divider',
                )}
              />
            ))}
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold tracking-[0.12px] text-rw-muted">
            <IconCamera className="size-[12px]" />
            {memories} memories
          </span>
        </div>
        <p className="text-[11px] tracking-[0.12px] text-rw-faint">
          {progress.label}
        </p>
      </div>
    )
  }

  const barTone =
    progress.mode === 'readiness'
      ? 'bg-rw-teal'
      : trip.lifecycle === 'draft'
        ? 'bg-[#b08968]'
        : 'bg-rw-teal'

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold tracking-[0.55px] text-rw-muted">
          {progress.title}
        </p>
        {progress.mode === 'readiness' ? (
          <p className="text-[11px] font-bold tracking-[0.55px] text-rw-teal">
            {progress.label}
          </p>
        ) : null}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-rw-surface-muted">
        <div
          className={cn('h-full rounded-full transition-[width] duration-500', barTone)}
          style={{ width: `${Math.min(100, progress.percent)}%` }}
        />
      </div>
      {progress.mode === 'itinerary' ? (
        <p className="text-[11px] tracking-[0.12px] text-rw-muted">
          {progress.label}
        </p>
      ) : null}
    </div>
  )
}
