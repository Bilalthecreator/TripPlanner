import { useEffect, useRef, useState } from 'react'
import { cn } from '../../utils/cn.js'
import { useDestinationLookup } from '../../hooks/useDestinationLookup.js'
import { IconPin } from '../common/Icons.jsx'

/**
 * Destination search field backed by Geoapify geocoding.
 * Manual free-text still works; selecting a suggestion stores normalized metadata.
 */
export function DestinationSearchField({
  value,
  country,
  error,
  onChange,
  onSelect,
  inputClassName,
  placeholder = 'Search cities worldwide…',
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const lookup = useDestinationLookup(value, { enabled: open || value.length > 0 })

  useEffect(() => {
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div ref={rootRef} className="relative space-y-1.5">
      <input
        value={value}
        onChange={(e) => {
          onChange?.(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        className={inputClassName}
        placeholder={placeholder}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
      />
      {error ? (
        <span className="block text-[12px] text-rw-accent">{error}</span>
      ) : null}

      {open && value.trim() ? (
        <div className="absolute z-40 mt-1 max-h-56 w-full overflow-auto rounded-2xl border border-rw-divider/70 bg-rw-surface shadow-lg">
          {lookup.status === 'loading' ? (
            <p className="px-3 py-3 text-[12px] text-rw-muted">Searching destinations…</p>
          ) : null}
          {lookup.status === 'error' ? (
            <p className="px-3 py-3 text-[12px] text-rw-accent">
              {lookup.error?.message || 'Destination search failed.'}
            </p>
          ) : null}
          {lookup.status === 'empty' ? (
            <p className="px-3 py-3 text-[12px] text-rw-muted">
              No matches. You can still save this destination as typed.
            </p>
          ) : null}
          {lookup.status === 'success'
            ? lookup.results.map((item) => (
                <button
                  key={item.id || `${item.name}-${item.latitude}`}
                  type="button"
                  className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-rw-surface-soft"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onSelect?.(item)
                    setOpen(false)
                  }}
                >
                  <IconPin className="mt-0.5 shrink-0 text-rw-accent" />
                  <span className="min-w-0">
                    <span className="block font-semibold text-rw-ink">{item.name}</span>
                    <span className="block truncate text-[12px] text-rw-muted">
                      {[item.region, item.country].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                </button>
              ))
            : null}
        </div>
      ) : null}

      {country ? (
        <p className={cn('text-[11px] text-rw-muted')}>Country: {country}</p>
      ) : null}
    </div>
  )
}
