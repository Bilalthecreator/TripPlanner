import { useState } from 'react'
import { cn } from '../../utils/cn.js'
import { EmptyState, ErrorState, SkeletonBlock } from '../common/StatusBlocks.jsx'
import { IconCamera, IconPin } from '../common/Icons.jsx'

export function DestinationHero({ status, data, error, onRetry, badges = [] }) {
  if (status === 'loading') {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:grid-rows-[460px]">
        <SkeletonBlock className="h-[280px] rounded-2xl lg:col-span-8 lg:h-full" />
        <div className="flex flex-col gap-4 lg:col-span-4">
          <SkeletonBlock className="h-[200px] rounded-xl lg:h-[222px]" />
          <SkeletonBlock className="h-[200px] rounded-xl lg:h-[222px]" />
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <ErrorState
        title="Images unavailable"
        message={error?.message || 'The destination gallery failed to load.'}
        onRetry={onRetry}
        className="min-h-[280px]"
      />
    )
  }

  if (status === 'empty' || !data?.gallery?.length) {
    return (
      <EmptyState
        title="No photos yet"
        message="This destination doesn’t have gallery images right now."
        actionLabel="Retry"
        onAction={onRetry}
      />
    )
  }

  const primary = data.gallery.find((item) => item.role === 'primary') ?? data.gallery[0]
  const secondary = data.gallery.find((item) => item.role === 'secondary')
  const photos = data.gallery.find((item) => item.role === 'photos')

  return (
    <div className="grid grid-cols-1 gap-4 overflow-hidden rounded-2xl shadow-md lg:grid-cols-12 lg:grid-rows-[460px]">
      <HeroPanel
        image={primary}
        badges={badges}
        className="min-h-[280px] lg:col-span-8 lg:min-h-[460px]"
        large
      />
      <div className="flex flex-col gap-4 lg:col-span-4">
        {secondary ? (
          <HeroPanel image={secondary} className="min-h-[200px] flex-1 rounded-xl lg:min-h-[222px]" />
        ) : null}
        {photos ? (
          <HeroPanel
            image={photos}
            className="min-h-[200px] flex-1 rounded-xl lg:min-h-[222px]"
            overlayCenter={
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full bg-white/90 px-4 py-1 text-[13px] font-semibold tracking-[0.26px] text-rw-ink shadow-lg backdrop-blur-[6px] dark:bg-black/70 dark:text-white"
              >
                <IconCamera />
                View all {data.photoCount} photos
              </button>
            }
          />
        ) : null}
      </div>
    </div>
  )
}

function HeroPanel({ image, className, large = false, overlayCenter, badges = [] }) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  return (
    <div className={cn('relative overflow-hidden bg-rw-surface-muted', className)}>
      {!loaded && !failed ? <SkeletonBlock className="absolute inset-0 rounded-none" /> : null}
      {failed ? (
        <div className="absolute inset-0 flex items-center justify-center bg-rw-surface-soft text-sm text-rw-muted">
          Image unavailable
        </div>
      ) : (
        <img
          src={image.image}
          alt=""
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition duration-500',
            loaded ? 'opacity-100' : 'opacity-0',
          )}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {large && badges.length ? (
        <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-1">
          {badges.map((badge) => (
            <span
              key={badge.label}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold tracking-[0.55px] shadow-sm backdrop-blur-[6px]',
                badge.tone === 'accent'
                  ? 'bg-[rgba(185,5,56,0.9)] text-white'
                  : 'bg-white/90 text-rw-ink',
              )}
            >
              {badge.tone !== 'accent' ? (
                <span className="size-2 rounded-full bg-rw-teal" />
              ) : null}
              <span className={badge.tone !== 'accent' ? 'uppercase' : ''}>{badge.label}</span>
            </span>
          ))}
        </div>
      ) : null}

      {large ? (
        <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-end justify-between gap-2">
          <div>
            {image.eyebrow ? (
              <p className="text-[11px] font-bold tracking-[1.1px] text-[#eae1d6] uppercase">
                {image.eyebrow}
              </p>
            ) : null}
            {image.caption ? (
              <p className="font-display text-lg font-semibold tracking-[-0.18px] text-white">
                {image.caption}
              </p>
            ) : null}
          </div>
          {image.meta ? (
            <p className="inline-flex items-center gap-1 text-xs tracking-[0.12px] text-[#dae2fd]">
              <IconPin className="text-[#dae2fd]" />
              {image.meta}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="absolute inset-x-2 bottom-2">
          {image.eyebrow ? (
            <p className="text-[11px] font-bold tracking-[0.55px] text-[#dae2fd] uppercase">
              {image.eyebrow}
            </p>
          ) : null}
          {image.caption ? (
            <p className="text-base font-semibold tracking-[-0.08px] text-white">
              {image.caption}
            </p>
          ) : null}
        </div>
      )}

      {overlayCenter ? (
        <div className="absolute inset-0 flex items-center justify-center p-2">{overlayCenter}</div>
      ) : null}
    </div>
  )
}
