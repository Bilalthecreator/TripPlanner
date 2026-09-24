import { CATEGORY_COLORS, categoryLabel } from '../../utils/budgetUtils.js'
import { SkeletonBlock } from '../common/StatusBlocks.jsx'

function Donut({ segments, size = 160 }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  let offset = 0

  if (!segments.length) {
    return (
      <svg width={size} height={size} viewBox="0 0 140 140" aria-hidden="true">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="18"
          className="text-rw-surface-muted"
        />
      </svg>
    )
  }

  return (
    <svg width={size} height={size} viewBox="0 0 140 140" aria-hidden="true">
      <g transform="rotate(-90 70 70)">
        {segments.map((segment) => {
          const length = (segment.percent / 100) * circumference
          const dash = `${length} ${circumference - length}`
          const el = (
            <circle
              key={segment.id}
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={CATEGORY_COLORS[segment.id] || '#94a3b8'}
              strokeWidth="18"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          )
          offset += length
          return el
        })}
      </g>
    </svg>
  )
}

export function CategoryBreakdown({ breakdown, totalLabel, currency }) {
  const segments = Array.isArray(breakdown) ? breakdown : []

  return (
    <section
      aria-label="Spending by category"
      className="rounded-3xl border border-rw-divider/60 bg-rw-surface p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-semibold text-rw-ink">
            By category
          </h2>
          <p className="mt-0.5 text-sm text-rw-muted">
            Share of spend across expense categories
          </p>
        </div>
        {totalLabel ? (
          <p className="text-[12px] font-semibold text-rw-muted">
            {totalLabel} · {currency}
          </p>
        ) : null}
      </div>

      {segments.length === 0 ? (
        <p className="mt-6 text-sm text-rw-muted">
          Category breakdown appears once you log expenses.
        </p>
      ) : (
        <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="relative shrink-0 text-rw-ink">
            <Donut segments={segments} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold tracking-[0.4px] text-rw-muted uppercase">
                Total
              </span>
              <span className="font-display text-sm font-semibold text-rw-ink">
                {totalLabel}
              </span>
            </div>
          </div>

          <ul className="w-full min-w-0 flex-1 space-y-3">
            {segments.map((item) => (
              <li key={item.id} className="min-w-0">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="inline-flex min-w-0 items-center gap-2 text-rw-ink">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          CATEGORY_COLORS[item.id] || '#94a3b8',
                      }}
                    />
                    <span className="truncate font-medium">
                      {item.label || categoryLabel(item.id)}
                    </span>
                  </span>
                  <span className="shrink-0 tabular-nums text-rw-muted">
                    {item.percent}% · {item.amountLabel}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-rw-surface-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.percent}%`,
                      backgroundColor:
                        CATEGORY_COLORS[item.id] || '#94a3b8',
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export function CategoryBreakdownSkeleton() {
  return (
    <div className="rounded-3xl border border-rw-divider/40 bg-rw-surface p-5">
      <SkeletonBlock className="h-5 w-36" />
      <SkeletonBlock className="mt-2 h-3 w-56" />
      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
        <SkeletonBlock className="size-40 shrink-0 rounded-full" />
        <div className="w-full space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonBlock key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
