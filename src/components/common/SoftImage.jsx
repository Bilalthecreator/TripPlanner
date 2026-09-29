import { useState } from 'react'
import { cn } from '../../utils/cn.js'
import fallbackHero from '../../assets/hero.png'

/**
 * Destination / attraction image with loading skeleton and failure fallback.
 * Image API failures never break the card.
 */
export function SoftImage({
  src,
  alt = '',
  className,
  imgClassName,
  attribution,
  attributionClassName,
}) {
  const resolved = src || fallbackHero
  const [currentSrc, setCurrentSrc] = useState(resolved)
  const [status, setStatus] = useState('loading')
  const [trackedSrc, setTrackedSrc] = useState(src)

  if (src !== trackedSrc) {
    setTrackedSrc(src)
    setCurrentSrc(resolved)
    setStatus('loading')
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {status === 'loading' ? (
        <div
          className="absolute inset-0 animate-pulse bg-rw-surface-muted"
          aria-hidden
        />
      ) : null}
      <img
        src={currentSrc}
        alt={alt}
        className={cn(
          'h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]',
          status === 'loading' && 'opacity-0',
          imgClassName,
        )}
        onLoad={() => setStatus('loaded')}
        onError={() => {
          if (currentSrc !== fallbackHero) {
            setCurrentSrc(fallbackHero)
            setStatus('loading')
            return
          }
          setStatus('error')
        }}
      />
      {status === 'error' ? (
        <div className="absolute inset-0 bg-gradient-to-br from-rw-surface-muted to-rw-input" />
      ) : null}
      {attribution?.photographer && status === 'loaded' ? (
        <a
          href={
            attribution.pageUrl ||
            attribution.photographerUrl ||
            attribution.sourceUrl
          }
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'absolute bottom-1 left-1 z-[1] max-w-[90%] truncate rounded bg-black/45 px-1.5 py-0.5 text-[9px] font-medium tracking-wide text-white/90 backdrop-blur-[2px]',
            attributionClassName,
          )}
        >
          {attribution.sourceLabel || 'Wikipedia'}: {attribution.photographer}
        </a>
      ) : null}
    </div>
  )
}
