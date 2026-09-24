import { IconPin } from '../common/Icons.jsx'

export function SearchSuggestions({ suggestions, onSelect, visible }) {
  if (!visible || suggestions.length === 0) return null

  return (
    <ul
      className="absolute inset-x-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-2xl border border-rw-divider/70 bg-rw-surface shadow-lg"
      role="listbox"
      aria-label="Search suggestions"
    >
      {suggestions.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            role="option"
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition hover:bg-rw-surface-soft"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(item)}
          >
            <IconPin className="text-rw-accent" />
            <span className="font-semibold text-rw-ink">{item.name}</span>
            <span className="text-xs text-rw-muted">
              {item.region} · {item.country}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
