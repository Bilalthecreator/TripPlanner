import { cn } from '../../utils/cn.js'

export function PreferenceRow({ title, description, children, className }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        <p className="text-sm font-semibold text-rw-ink">{title}</p>
        {description ? (
          <p className="text-[13px] leading-5 text-rw-muted">{description}</p>
        ) : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export function PreferencesSection({ id, title, description, children }) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-3xl border border-rw-divider/50 bg-rw-surface p-5 shadow-[0_1px_2px_var(--color-rw-card-shadow)] sm:p-6"
    >
      <div className="mb-5">
        <h2 className="font-display text-lg font-semibold text-rw-ink">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-rw-muted">{description}</p>
        ) : null}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  )
}

export function ToggleSwitch({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-7 w-12 rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rw-accent',
        checked ? 'bg-rw-accent' : 'bg-rw-surface-muted',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 size-6 rounded-full bg-white shadow transition',
          checked ? 'left-[22px]' : 'left-0.5',
        )}
      />
    </button>
  )
}

export function SegmentedControl({ options, value, onChange }) {
  return (
    <div
      className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"
      role="radiogroup"
    >
      {options.map((option) => {
        const active = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.id)}
            className={cn(
              'rounded-xl border px-3 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rw-accent',
              active
                ? 'border-rw-accent bg-rw-accent text-white shadow-sm'
                : 'border-rw-divider/70 bg-rw-input text-rw-ink hover:border-rw-accent/40 hover:bg-rw-surface-soft',
            )}
          >
            {option.symbol ? (
              <span className="mr-1 opacity-90">{option.symbol}</span>
            ) : null}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
