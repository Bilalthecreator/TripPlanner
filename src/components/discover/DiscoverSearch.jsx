import {
  IconCalendar,
  IconSearch,
  IconSliders,
  IconTravelers,
} from '../common/Icons.jsx'
import { SearchSuggestions } from './SearchSuggestions.jsx'

export function DiscoverSearch({
  value,
  onChange,
  onSubmit,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  onSelectSuggestion,
}) {
  return (
    <div className="flex flex-col gap-1">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit?.()
          setShowSuggestions(false)
        }}
        className="flex flex-col gap-2 rounded-2xl bg-rw-search p-2 shadow-sm lg:flex-row lg:items-center"
      >
        <div className="relative min-w-0 flex-1">
          <label className="flex items-center gap-2 rounded-full bg-rw-input px-4 py-2 shadow-sm">
            <IconSearch className="shrink-0 text-rw-muted" />
            <input
              type="search"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                // delay so suggestion click registers
                setTimeout(() => setShowSuggestions(false), 120)
              }}
              placeholder="Search destinations, cities, sacred spots, trails..."
              className="w-full min-w-0 bg-transparent text-sm text-rw-muted outline-none placeholder:text-rw-muted"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={showSuggestions}
            />
            <button
              type="button"
              className="shrink-0 p-1 text-rw-muted"
              aria-label="Search filters"
            >
              <IconSliders />
            </button>
          </label>

          <SearchSuggestions
            suggestions={suggestions}
            visible={showSuggestions}
            onSelect={onSelectSuggestion}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 lg:shrink-0">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-rw-input px-4 py-2 text-[13px] font-semibold tracking-[0.26px] text-rw-ink shadow-sm"
          >
            <IconCalendar className="text-rw-muted" />
            <span className="whitespace-nowrap">Oct 14 - Oct 26</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-rw-input px-4 py-2 text-[13px] font-semibold tracking-[0.26px] text-rw-ink shadow-sm"
          >
            <IconTravelers className="text-rw-muted" />
            <span className="whitespace-nowrap">2 Travelers</span>
          </button>
          <button
            type="submit"
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-full bg-rw-accent px-6 py-2 text-[13px] font-semibold tracking-[0.26px] text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] sm:flex-none"
          >
            <IconSearch className="size-[15px] text-white" />
            Explore
          </button>
        </div>
      </form>
    </div>
  )
}
