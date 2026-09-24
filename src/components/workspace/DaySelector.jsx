import { cn } from '../../utils/cn.js'
import { formatMoney } from '../../utils/tripMetrics.js'
import { getDayActivityCost } from '../../utils/workspaceStats.js'
import { IconPlus } from '../common/Icons.jsx'

function dayStatus(day, index, selectedId) {
  const acts = day.activities || []
  const allDone = acts.length > 0 && acts.every((a) => a.completed)
  if (day.id === selectedId) return 'active'
  if (allDone) return 'done'
  return 'upcoming'
}

export function DaySelector({
  days,
  selectedDayId,
  onSelect,
  onAddDay,
  currency = 'USD',
}) {
  return (
    <aside className="flex h-full flex-col rounded-3xl bg-rw-surface p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold text-rw-ink">
          Trip Schedule
        </h2>
        <span className="text-[11px] font-bold tracking-[0.55px] text-rw-muted">
          {days.length} SEGMENTS
        </span>
      </div>

      <ul className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin lg:max-h-[560px] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0">
        {days.map((day, index) => {
          const status = dayStatus(day, index, selectedDayId)
          const cost = getDayActivityCost(day)
          const count = day.activities?.length || 0

          return (
            <li key={day.id} className="min-w-[220px] lg:min-w-0">
              <button
                type="button"
                onClick={() => onSelect(day.id)}
                className={cn(
                  'w-full rounded-2xl border px-3 py-3 text-left transition',
                  status === 'active'
                    ? 'border-rw-accent bg-rw-accent/5 shadow-sm'
                    : status === 'done'
                      ? 'border-rw-teal/30 bg-rw-teal/5'
                      : 'border-rw-divider/60 bg-rw-surface-soft/40 hover:border-rw-divider',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
                    Day {String(index + 1).padStart(2, '0')}
                    {status === 'active' ? ' · Today' : ''}
                  </p>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.4px] uppercase',
                      status === 'active' && 'bg-rw-accent text-white',
                      status === 'done' &&
                        'bg-rw-teal/15 text-rw-teal',
                      status === 'upcoming' &&
                        'bg-rw-surface-muted text-rw-muted',
                    )}
                  >
                    {status === 'active'
                      ? 'Active'
                      : status === 'done'
                        ? 'Done'
                        : 'Upcoming'}
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-rw-faint">{day.date}</p>
                <p className="mt-0.5 line-clamp-1 text-sm font-semibold text-rw-ink">
                  {day.title || `Day ${index + 1}`}
                </p>
                <p className="mt-2 text-[11px] text-rw-muted">
                  {count} {count === 1 ? 'activity' : 'activities'}
                  {cost > 0 ? ` · ${formatMoney(cost, currency)}` : ''}
                </p>
              </button>
            </li>
          )
        })}
      </ul>

      <button
        type="button"
        onClick={onAddDay}
        className="mt-3 inline-flex items-center justify-center gap-1 rounded-full border border-dashed border-rw-divider px-3 py-2 text-[12px] font-semibold text-rw-ink transition hover:border-rw-accent hover:text-rw-accent"
      >
        <IconPlus className="size-[10px]" />
        Add Day {days.length + 1} to Trip
      </button>
    </aside>
  )
}
