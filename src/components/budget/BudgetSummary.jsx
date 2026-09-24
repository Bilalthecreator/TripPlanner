import { cn } from '../../utils/cn.js'
import { SkeletonBlock } from '../common/StatusBlocks.jsx'

const TONE_RING = {
  good: 'text-rw-teal',
  ok: 'text-amber-500',
  warn: 'text-orange-500',
  danger: 'text-rw-accent',
  neutral: 'text-rw-muted',
}

export function BudgetSummary({ summary }) {
  if (!summary) return null

  const cards = [
    {
      id: 'budget',
      label: 'Total budget',
      value: summary.totalBudgetLabel,
      hint:
        summary.totalBudget > 0
          ? 'Trip spending cap'
          : 'Set a budget in trip settings',
    },
    {
      id: 'spent',
      label: 'Total spent',
      value: summary.totalSpentLabel,
      hint: `${summary.expenseCount} expense${summary.expenseCount === 1 ? '' : 's'}`,
    },
    {
      id: 'remaining',
      label: 'Remaining',
      value: summary.remainingLabel,
      hint:
        summary.totalBudget > 0
          ? `${summary.percentUsed}% of budget used`
          : 'Add a trip budget to track remaining',
      tone: summary.tone,
    },
  ]

  return (
    <section aria-label="Budget summary" className="grid gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <article
          key={card.id}
          className="rounded-3xl border border-rw-divider/60 bg-rw-surface p-4 shadow-sm sm:p-5"
        >
          <p className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
            {card.label}
          </p>
          <p
            className={cn(
              'mt-2 font-display text-2xl font-semibold tracking-[-0.35px] text-rw-ink',
              card.tone && TONE_RING[card.tone],
            )}
          >
            {card.value}
          </p>
          <p className="mt-1 text-[12px] text-rw-faint">{card.hint}</p>
          {card.id === 'remaining' && summary.totalBudget > 0 ? (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-rw-surface-muted">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  summary.tone === 'danger'
                    ? 'bg-rw-accent'
                    : summary.tone === 'warn'
                      ? 'bg-orange-400'
                      : 'bg-rw-teal',
                )}
                style={{
                  width: `${Math.min(100, summary.percentUsed)}%`,
                }}
              />
            </div>
          ) : null}
        </article>
      ))}
    </section>
  )
}

export function BudgetSummarySkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-3xl border border-rw-divider/40 bg-rw-surface p-5"
        >
          <SkeletonBlock className="h-3 w-24" />
          <SkeletonBlock className="mt-3 h-8 w-32" />
          <SkeletonBlock className="mt-2 h-3 w-40" />
        </div>
      ))}
    </div>
  )
}
