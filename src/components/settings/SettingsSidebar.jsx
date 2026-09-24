import { SETTINGS_NAV } from '../../data/preferences.js'
import { cn } from '../../utils/cn.js'

export function SettingsSidebar({
  activeId,
  onSelect,
  storageUsedMb,
  storageCapMb = 12,
}) {
  const pct = Math.min(100, Math.round((storageUsedMb / storageCapMb) * 100))

  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
      <nav
        className="flex gap-1 overflow-x-auto rounded-2xl bg-rw-surface p-1.5 shadow-sm scrollbar-thin lg:flex-col lg:overflow-visible"
        aria-label="Settings sections"
      >
        {SETTINGS_NAV.map((item) => {
          const active = item.id === activeId
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                'shrink-0 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold tracking-[0.26px] transition',
                active
                  ? 'bg-rw-accent text-white shadow-sm'
                  : 'text-rw-muted hover:bg-rw-surface-muted/80 hover:text-rw-ink',
              )}
            >
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="hidden rounded-2xl border border-rw-divider/50 bg-rw-surface p-4 shadow-sm lg:block">
        <p className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
          Local Storage Stats
        </p>
        <p className="mt-2 text-sm font-semibold text-rw-ink">
          Data stored locally
        </p>
        <p className="mt-1 text-[12px] text-rw-muted">
          {storageUsedMb.toFixed(1)} MB / {storageCapMb} MB
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-rw-surface-muted">
          <div
            className="h-full rounded-full bg-rw-accent transition-[width]"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </aside>
  )
}
