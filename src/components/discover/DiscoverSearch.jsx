import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconCalendar,
  IconSearch,
  IconSliders,
  IconTravelers,
} from '../common/Icons.jsx'
import { SearchSuggestions } from './SearchSuggestions.jsx'
import { usePreferences } from '../../store/usePreferences.js'
import { toISODate } from '../../utils/tripHelpers.js'
import { formatTripDateRange } from '../../utils/tripMetrics.js'
import { cn } from '../../utils/cn.js'

function defaultDateRange() {
  const start = new Date()
  start.setHours(12, 0, 0, 0)
  start.setDate(start.getDate() + 14)
  const end = new Date(start)
  end.setDate(end.getDate() + 12)
  return { startDate: toISODate(start), endDate: toISODate(end) }
}

function compactDateLabel(startDate, endDate) {
  const start = startDate ? new Date(`${startDate}T12:00:00`) : null
  const end = endDate ? new Date(`${endDate}T12:00:00`) : null
  if (!start || Number.isNaN(start.getTime()) || !end || Number.isNaN(end.getTime())) {
    return 'Pick dates'
  }
  const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
  return `${fmt.format(start)} - ${fmt.format(end)}`
}

export function DiscoverSearch({
  value,
  onChange,
  onSubmit,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  onSelectSuggestion,
}) {
  const navigate = useNavigate()
  const { defaultTravelers } = usePreferences()
  const defaults = defaultDateRange()
  const [startDate, setStartDate] = useState(defaults.startDate)
  const [endDate, setEndDate] = useState(defaults.endDate)
  const [travelers, setTravelers] = useState(defaultTravelers || 2)
  const [openPanel, setOpenPanel] = useState(null)
  const panelRootRef = useRef(null)

  useEffect(() => {
    setTravelers(defaultTravelers || 2)
  }, [defaultTravelers])

  useEffect(() => {
    if (!openPanel) return undefined
    const onPointerDown = (event) => {
      if (!panelRootRef.current?.contains(event.target)) {
        setOpenPanel(null)
      }
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpenPanel(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [openPanel])

  const togglePanel = (panel) => {
    setShowSuggestions(false)
    setOpenPanel((current) => (current === panel ? null : panel))
  }

  const handleStartDateChange = (next) => {
    setStartDate(next)
    if (endDate && next && endDate < next) setEndDate(next)
  }

  const handleEndDateChange = (next) => {
    setEndDate(next)
    if (startDate && next && next < startDate) setStartDate(next)
  }

  const handleExplore = () => {
    setOpenPanel(null)
    setShowSuggestions(false)
    onSubmit?.()

    const destination = String(value || '').trim()
    navigate('/trips/new', {
      state: {
        startDate,
        endDate,
        travelers,
        ...(destination
          ? {
              destination,
              name: `${destination} Trip`,
            }
          : {}),
      },
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleExplore()
        }}
        className="flex flex-col gap-2 rounded-2xl bg-rw-search p-2 shadow-sm lg:flex-row lg:items-center"
      >
        <div className="relative min-w-0 flex-1">
          <label className="flex items-center gap-2 rounded-full bg-rw-input px-4 py-2 shadow-sm">
            <IconSearch className="text-rw-muted" />
            <input
              type="search"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => {
                setOpenPanel(null)
                setShowSuggestions(true)
              }}
              onBlur={() => {
                // delay so suggestion click registers
                setTimeout(() => setShowSuggestions(false), 120)
              }}
              placeholder="Search destinations, cities, sacred spots, trails..."
              className="w-full min-w-0 bg-transparent text-sm text-rw-ink outline-none placeholder:text-rw-muted"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={showSuggestions}
            />
            <button
              type="button"
              className="shrink-0 p-1 text-rw-muted"
              aria-label="Search filters"
              onClick={() => {
                document
                  .getElementById('discover-filters')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
              }}
            >
              <IconSliders className="text-rw-muted" />
            </button>
          </label>

          <SearchSuggestions
            suggestions={suggestions}
            visible={showSuggestions}
            onSelect={onSelectSuggestion}
          />
        </div>

        <div
          ref={panelRootRef}
          className="relative flex flex-wrap items-center gap-1 lg:shrink-0"
        >
          <button
            type="button"
            aria-expanded={openPanel === 'dates'}
            aria-haspopup="dialog"
            onClick={() => togglePanel('dates')}
            className={cn(
              'inline-flex items-center gap-1 rounded-full bg-rw-input px-4 py-2 text-[13px] font-semibold tracking-[0.26px] text-rw-ink shadow-sm transition hover:bg-rw-surface',
              openPanel === 'dates' && 'ring-2 ring-rw-accent/30',
            )}
          >
            <IconCalendar className="text-rw-muted" />
            <span className="whitespace-nowrap">
              {compactDateLabel(startDate, endDate)}
            </span>
          </button>

          <button
            type="button"
            aria-expanded={openPanel === 'travelers'}
            aria-haspopup="dialog"
            onClick={() => togglePanel('travelers')}
            className={cn(
              'inline-flex items-center gap-1 rounded-full bg-rw-input px-4 py-2 text-[13px] font-semibold tracking-[0.26px] text-rw-ink shadow-sm transition hover:bg-rw-surface',
              openPanel === 'travelers' && 'ring-2 ring-rw-accent/30',
            )}
          >
            <IconTravelers className="text-rw-muted" />
            <span className="whitespace-nowrap">
              {travelers} {travelers === 1 ? 'Traveler' : 'Travelers'}
            </span>
          </button>

          <button
            type="submit"
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-full bg-rw-accent px-6 py-2 text-[13px] font-semibold tracking-[0.26px] text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] transition hover:brightness-110 sm:flex-none"
          >
            <IconSearch className="size-[15px] text-white" />
            Explore
          </button>

          {openPanel === 'dates' ? (
            <div
              role="dialog"
              aria-label="Select travel dates"
              className="absolute top-[calc(100%+0.5rem)] left-0 z-30 w-[min(100vw-2rem,320px)] rounded-2xl border border-rw-divider/60 bg-rw-surface p-4 shadow-lg"
            >
              <p className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
                Travel dates
              </p>
              <p className="mt-1 text-[12px] text-rw-faint">
                {formatTripDateRange(startDate, endDate)}
              </p>
              <div className="mt-3 grid gap-3">
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-semibold text-rw-muted">
                    Start
                  </span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-full rounded-xl border border-rw-divider/70 bg-rw-input px-3 py-2 text-sm text-rw-ink outline-none focus:border-rw-accent/60"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-[11px] font-semibold text-rw-muted">
                    End
                  </span>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    className="w-full rounded-xl border border-rw-divider/70 bg-rw-input px-3 py-2 text-sm text-rw-ink outline-none focus:border-rw-accent/60"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => setOpenPanel(null)}
                className="mt-3 w-full rounded-full bg-rw-accent px-4 py-2 text-[12px] font-semibold text-white transition hover:brightness-110"
              >
                Done
              </button>
            </div>
          ) : null}

          {openPanel === 'travelers' ? (
            <div
              role="dialog"
              aria-label="Select travelers"
              className="absolute top-[calc(100%+0.5rem)] right-0 z-30 w-[min(100vw-2rem,280px)] rounded-2xl border border-rw-divider/60 bg-rw-surface p-4 shadow-lg sm:left-auto"
            >
              <p className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
                Travelers
              </p>
              <div className="mt-3 inline-flex w-full items-center justify-between gap-3 rounded-full bg-rw-input p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setTravelers((n) => Math.max(1, n - 1))}
                  disabled={travelers <= 1}
                  className="size-9 rounded-full bg-rw-surface text-lg font-semibold text-rw-ink transition hover:bg-rw-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Decrease travelers"
                >
                  −
                </button>
                <span className="min-w-28 text-center text-sm font-semibold text-rw-ink">
                  {travelers} {travelers === 1 ? 'Traveler' : 'Travelers'}
                </span>
                <button
                  type="button"
                  onClick={() => setTravelers((n) => Math.min(30, n + 1))}
                  disabled={travelers >= 30}
                  className="size-9 rounded-full bg-rw-surface text-lg font-semibold text-rw-ink transition hover:bg-rw-surface-muted disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Increase travelers"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => setOpenPanel(null)}
                className="mt-3 w-full rounded-full bg-rw-accent px-4 py-2 text-[12px] font-semibold text-white transition hover:brightness-110"
              >
                Done
              </button>
            </div>
          ) : null}
        </div>
      </form>
    </div>
  )
}
