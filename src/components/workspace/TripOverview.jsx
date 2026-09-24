import { formatMoney } from '../../utils/tripMetrics.js'
import { formatDuration } from '../../utils/workspaceStats.js'
import { IconClock, IconPin } from '../common/Icons.jsx'

function StatCard({ eyebrow, children }) {
  return (
    <article className="flex min-h-[132px] flex-col gap-2 rounded-2xl bg-rw-surface p-4 shadow-[0_1px_2px_var(--color-rw-card-shadow)]">
      <p className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
        {eyebrow}
      </p>
      {children}
    </article>
  )
}

export function TripOverview({ stats }) {
  const next = stats.nextActivity

  return (
    <section
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Trip overview"
    >
      <StatCard eyebrow="Pace & Cadence">
        <p className="font-display text-2xl font-semibold text-rw-ink">
          Day {stats.dayNumber}{' '}
          <span className="text-rw-muted">/ {stats.dayCount}</span>
        </p>
        <p className="text-sm text-rw-muted line-clamp-2">{stats.focusTitle}</p>
      </StatCard>

      <StatCard eyebrow="Activities Status">
        <p className="font-display text-2xl font-semibold text-rw-ink">
          {stats.completed}{' '}
          <span className="text-base font-medium text-rw-muted">done</span>
        </p>
        <p className="text-sm text-rw-muted">
          {stats.scheduledToday} scheduled for selected day
        </p>
        <p className="text-[12px] font-semibold text-rw-teal">
          {stats.percent}% schedule completion overall
        </p>
      </StatCard>

      <StatCard eyebrow="Next Up">
        {next ? (
          <>
            <p className="font-display text-lg font-semibold text-rw-ink line-clamp-2">
              {next.title}
            </p>
            <div className="flex flex-wrap gap-2 text-[12px] text-rw-muted">
              {next.startTime ? (
                <span className="inline-flex items-center gap-1">
                  <IconClock />
                  {next.startTime}
                  {formatDuration(next.durationMinutes)
                    ? ` · ${formatDuration(next.durationMinutes)}`
                    : ''}
                </span>
              ) : null}
              {next.placeName ? (
                <span className="inline-flex items-center gap-1">
                  <IconPin />
                  {next.placeName}
                </span>
              ) : null}
            </div>
            {next.ticketRef ? (
              <span className="mt-auto w-fit rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                Tickets Confirmed · {next.ticketRef}
              </span>
            ) : (
              <span className="mt-auto w-fit rounded-full bg-rw-accent/10 px-2 py-0.5 text-[11px] font-bold text-rw-accent">
                Upcoming
              </span>
            )}
          </>
        ) : (
          <p className="text-sm text-rw-muted">
            No upcoming activities on this trip yet.
          </p>
        )}
      </StatCard>

      <StatCard eyebrow="Budget Burn">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-2xl font-semibold text-rw-ink">
              {stats.spentLabel}
            </p>
            <p className="text-sm text-rw-muted">
              Target cap {stats.capLabel}
            </p>
            <p className="mt-1 text-[12px] font-semibold text-rw-muted">
              {stats.budget.percentUsed}% utilized · {stats.budget.label}
            </p>
          </div>
          <BudgetRing percent={stats.budget.percentUsed} />
        </div>
      </StatCard>
    </section>
  )
}

function BudgetRing({ percent }) {
  const p = Math.min(100, Math.max(0, percent || 0))
  const r = 18
  const c = 2 * Math.PI * r
  const offset = c - (p / 100) * c

  return (
    <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
      <circle
        cx="26"
        cy="26"
        r={r}
        fill="none"
        stroke="var(--color-rw-surface-muted)"
        strokeWidth="6"
      />
      <circle
        cx="26"
        cy="26"
        r={r}
        fill="none"
        stroke="var(--color-rw-accent)"
        strokeWidth="6"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
      />
      <text
        x="26"
        y="30"
        textAnchor="middle"
        className="fill-rw-ink text-[10px] font-bold"
      >
        {p}%
      </text>
    </svg>
  )
}

export function UpcomingActivities({ activities, currency = 'USD' }) {
  if (!activities?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-rw-divider bg-rw-surface p-5 text-sm text-rw-muted">
        Upcoming activities will appear here as you schedule them.
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {activities.map((act) => (
        <li
          key={act.id}
          className="flex items-start justify-between gap-3 rounded-2xl bg-rw-surface px-4 py-3 shadow-sm"
        >
          <div className="min-w-0">
            <p className="font-semibold text-rw-ink">{act.title}</p>
            <p className="mt-0.5 text-[12px] text-rw-muted">
              {[act.startTime, act.placeName].filter(Boolean).join(' · ') ||
                'Time TBD'}
            </p>
          </div>
          {act.cost ? (
            <span className="shrink-0 text-[12px] font-semibold text-rw-muted">
              {formatMoney(act.cost, currency)}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  )
}
