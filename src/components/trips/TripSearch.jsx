import { IconSearch, IconSliders } from '../common/Icons.jsx'
import { cn } from '../../utils/cn.js'

export function TripSearch({
  value,
  onChange,
  disabled = false,
  className,
}) {
  return (
    <label
      className={cn(
        'flex min-w-0 flex-1 items-center gap-2 rounded-full border border-rw-divider/50 bg-rw-input px-4 py-2 shadow-sm',
        disabled && 'opacity-60',
        className,
      )}
    >
      <IconSearch className="shrink-0 text-rw-muted" />
      <input
        type="search"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search destination (e.g. Kyoto, Bar..."
        className="w-full min-w-0 bg-transparent text-sm text-rw-ink outline-none placeholder:text-rw-muted"
        autoComplete="off"
        aria-label="Search trips by destination or name"
      />
      <span className="shrink-0 p-1 text-rw-muted" aria-hidden="true">
        <IconSliders />
      </span>
    </label>
  )
}
