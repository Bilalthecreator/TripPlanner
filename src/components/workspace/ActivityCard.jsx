import { cn } from '../../utils/cn.js'
import { formatMoney } from '../../utils/tripMetrics.js'
import { formatDuration } from '../../utils/workspaceStats.js'
import { IconClock, IconPin } from '../common/Icons.jsx'

export function ActivityCard({
  activity,
  currency,
  isNext,
  dayOptions,
  onToggleComplete,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onMoveToDay,
  canMoveUp,
  canMoveDown,
}) {
  return (
    <article
      className={cn(
        'relative rounded-2xl border bg-rw-surface p-4 shadow-sm transition',
        isNext
          ? 'border-rw-accent shadow-[0_0_0_1px_rgba(185,5,56,0.12)]'
          : activity.completed
            ? 'border-rw-teal/25 bg-rw-teal/5'
            : 'border-rw-divider/50',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-rw-ink">
            <IconClock className="text-rw-faint" />
            {activity.startTime || 'TBD'}
            {formatDuration(activity.durationMinutes)
              ? ` · ${formatDuration(activity.durationMinutes)}`
              : ''}
          </span>
          {activity.category ? (
            <span className="rounded-full bg-rw-surface-muted px-2 py-0.5 text-[10px] font-bold tracking-[0.4px] text-rw-muted uppercase">
              {activity.category}
            </span>
          ) : null}
          {isNext ? (
            <span className="rounded-full bg-rw-accent px-2 py-0.5 text-[10px] font-bold tracking-[0.4px] text-white uppercase">
              Next up
            </span>
          ) : null}
          {activity.completed ? (
            <span className="rounded-full bg-rw-teal/15 px-2 py-0.5 text-[10px] font-bold tracking-[0.4px] text-rw-teal uppercase">
              Completed
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="rounded-full px-2 py-1 text-[11px] font-semibold text-rw-muted disabled:opacity-30"
            aria-label="Move earlier"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="rounded-full px-2 py-1 text-[11px] font-semibold text-rw-muted disabled:opacity-30"
            aria-label="Move later"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full px-2 py-1 text-[11px] font-semibold text-rw-ink hover:bg-rw-surface-muted"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-full px-2 py-1 text-[11px] font-semibold text-rw-accent hover:bg-rw-accent/10"
          >
            Delete
          </button>
        </div>
      </div>

      <h3 className="mt-2 font-display text-lg font-semibold text-rw-ink">
        {activity.title}
      </h3>

      {activity.notes ? (
        <p className="mt-1 text-sm leading-[20px] text-rw-muted">
          {activity.notes}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-rw-muted">
        {activity.placeName ? (
          <span className="inline-flex items-center gap-1">
            <IconPin />
            {activity.placeName}
          </span>
        ) : null}
        <span className="font-semibold">
          {activity.cost
            ? formatMoney(activity.cost, currency)
            : 'Free'}
        </span>
        {activity.ticketRef ? (
          <span className="rounded-full bg-rw-surface-muted px-2 py-0.5 font-semibold">
            E-Ticket #{activity.ticketRef}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-rw-divider/40 pt-3">
        <button
          type="button"
          onClick={onToggleComplete}
          className={cn(
            'rounded-full px-3 py-1.5 text-[12px] font-semibold transition',
            activity.completed
              ? 'bg-rw-teal text-white'
              : 'bg-rw-surface-muted text-rw-ink hover:bg-rw-chip',
          )}
        >
          {activity.completed ? 'Completed' : 'Mark complete'}
        </button>

        <label className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-rw-muted">
          Move to
          <select
            className="rounded-lg border border-rw-divider bg-rw-input px-2 py-1 text-[12px] text-rw-ink"
            value=""
            onChange={(e) => {
              const toDayId = e.target.value
              if (toDayId) onMoveToDay(toDayId)
              e.target.value = ''
            }}
          >
            <option value="" disabled>
              Choose day…
            </option>
            {dayOptions.map((opt) => (
              <option key={opt.id} value={opt.id} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </article>
  )
}
