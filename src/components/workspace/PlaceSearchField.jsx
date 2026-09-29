import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePlaceLookup } from '../../hooks/usePlaceLookup.js'
import { IconPin } from '../common/Icons.jsx'

/**
 * Optional place picker near trip destination.
 * Manual place names remain fully supported without API selection.
 */
export function PlaceSearchField({
  value,
  category,
  latitude,
  longitude,
  fallbackQuery = '',
  onChange,
  onSelect,
  inputClassName,
  placeholder = 'Neighborhood or venue',
}) {
  const [open, setOpen] = useState(false)
  const [menuBox, setMenuBox] = useState(null)
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const hasCoords =
    Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))
  const canSearch = hasCoords || Boolean(String(fallbackQuery || '').trim())
  const lookup = usePlaceLookup({
    query: value,
    latitude,
    longitude,
    fallbackQuery,
    category,
    enabled: open && canSearch,
  })

  useLayoutEffect(() => {
    if (!open || !canSearch || !inputRef.current) {
      setMenuBox(null)
      return undefined
    }
    const update = () => {
      const rect = inputRef.current.getBoundingClientRect()
      setMenuBox({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      })
    }
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, canSearch, value, lookup.status])

  useEffect(() => {
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) {
        const menu = document.getElementById('place-search-menu')
        if (menu?.contains(e.target)) return
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const showMenu = open && canSearch && menuBox

  const menu = showMenu
    ? createPortal(
        <div
          id="place-search-menu"
          role="listbox"
          className="fixed z-[220] max-h-52 overflow-auto rounded-2xl border border-rw-divider/70 bg-rw-surface shadow-lg"
          style={{
            top: menuBox.top,
            left: menuBox.left,
            width: menuBox.width,
          }}
        >
          {lookup.status === 'loading' ? (
            <p className="px-3 py-3 text-[12px] text-rw-muted">
              Finding places…
            </p>
          ) : null}
          {lookup.status === 'error' ? (
            <p className="px-3 py-3 text-[12px] text-rw-accent">
              Place search failed. Keep typing a manual place name.
            </p>
          ) : null}
          {lookup.status === 'empty' ? (
            <p className="px-3 py-3 text-[12px] text-rw-muted">
              No nearby places matched. Manual entry is fine.
            </p>
          ) : null}
          {lookup.status === 'success'
            ? lookup.results.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  role="option"
                  className="flex w-full items-start gap-2 px-3 py-2.5 text-left hover:bg-rw-surface-soft"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onSelect?.(place)
                    setOpen(false)
                  }}
                >
                  <IconPin className="mt-0.5 size-3.5 shrink-0 text-rw-teal" />
                  <span className="min-w-0">
                    <span className="block font-semibold text-rw-ink">
                      {place.name}
                    </span>
                    <span className="block truncate text-[12px] text-rw-muted">
                      {[place.category, place.address || place.location]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>
                </button>
              ))
            : null}
          {lookup.status === 'idle' && !value.trim() ? (
            <p className="px-3 py-3 text-[12px] text-rw-muted">
              Finding nearby {category?.toLowerCase() || 'places'}…
            </p>
          ) : null}
        </div>,
        document.body,
      )
    : null

  return (
    <div ref={rootRef} className="relative space-y-1.5">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => {
          onChange?.(e.target.value, { clearPlaceMeta: true })
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        className={inputClassName}
        placeholder={
          canSearch ? `${placeholder} (search nearby places)` : placeholder
        }
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={showMenu}
        aria-controls={showMenu ? 'place-search-menu' : undefined}
      />

      {menu}

      {!canSearch ? (
        <p className="text-[11px] text-rw-muted">
          Manual place entry — attach coordinates by selecting a mapped
          destination on the trip.
        </p>
      ) : null}
    </div>
  )
}
