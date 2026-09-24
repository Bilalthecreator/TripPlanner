import { cn } from '../../utils/cn.js'

export function EmptyState({
  title = 'Nothing here yet',
  message,
  actionLabel,
  onAction,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-3xl border border-rw-divider/60 bg-rw-surface px-6 py-10 text-center shadow-sm',
        className,
      )}
    >
      <h3 className="font-display text-lg font-semibold text-rw-ink">{title}</h3>
      {message ? (
        <p className="max-w-md text-sm leading-[22px] text-rw-muted">{message}</p>
      ) : null}
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-1 rounded-full bg-rw-accent px-5 py-2 text-[13px] font-semibold tracking-[0.26px] text-white shadow-[0_4px_12px_-4px_rgba(185,5,56,0.35)] transition hover:brightness-110"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}

export function ErrorState({
  title = 'Couldn’t load this section',
  message = 'Something went wrong. You can retry without leaving the page.',
  onRetry,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-start gap-3 rounded-3xl border border-rw-accent/20 bg-rw-surface p-5 shadow-sm',
        className,
      )}
    >
      <div>
        <h3 className="font-display text-base font-semibold text-rw-ink">{title}</h3>
        <p className="mt-1 text-sm leading-[22px] text-rw-muted">{message}</p>
      </div>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full bg-rw-accent px-4 py-2 text-[12px] font-bold tracking-[0.55px] text-white transition hover:brightness-110"
        >
          Retry
        </button>
      ) : null}
    </div>
  )
}

export function SkeletonBlock({ className }) {
  return <div className={cn('skeleton rounded-2xl', className)} />
}

export function SkeletonCard({ variant = 'destination' }) {
  if (variant === 'weather') {
    return (
      <div className="flex h-full min-h-[251px] flex-col gap-4 rounded-3xl bg-rw-surface-soft p-6 shadow-sm">
        <div className="flex justify-between">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <SkeletonBlock className="h-12 w-36" />
          <SkeletonBlock className="h-12 w-20" />
        </div>
        <SkeletonBlock className="h-[72px] w-full rounded-2xl" />
        <SkeletonBlock className="h-4 w-full" />
      </div>
    )
  }

  if (variant === 'attraction') {
    return (
      <div className="w-[280px] shrink-0 rounded-2xl bg-rw-surface-soft p-2 shadow-sm sm:w-[320px]">
        <SkeletonBlock className="h-40 w-full rounded-xl" />
        <div className="space-y-2 p-2 pt-4">
          <SkeletonBlock className="h-5 w-3/4" />
          <SkeletonBlock className="h-4 w-1/2" />
          <SkeletonBlock className="h-8 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-3xl bg-rw-surface shadow-sm">
      <SkeletonBlock className="h-56 w-full rounded-none" />
      <div className="space-y-3 p-4">
        <SkeletonBlock className="h-5 w-2/3" />
        <SkeletonBlock className="h-10 w-full" />
        <div className="flex justify-between pt-1">
          <SkeletonBlock className="h-8 w-16" />
          <SkeletonBlock className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </div>
  )
}
