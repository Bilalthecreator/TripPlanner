import { cn } from '../../utils/cn.js'
import { formatMoney } from '../../utils/tripMetrics.js'

const TONE_CLASS = {
  good: 'bg-rw-surface-muted text-rw-muted',
  ok: 'bg-rw-surface-muted text-rw-muted',
  warn: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  danger: 'bg-rw-accent/10 text-rw-accent',
  final: 'bg-rw-surface-muted text-rw-muted',
  neutral: 'bg-rw-surface-muted text-rw-muted',
}

export function TripBudgetStatus({ budget }) {
  if (!budget || budget.total <= 0) {
    return (
      <span className="inline-flex rounded-full bg-rw-surface-muted px-2.5 py-1 text-[11px] font-semibold tracking-[0.12px] text-rw-muted">
        No budget set
      </span>
    )
  }

  const spentLabel = formatMoney(budget.spent, budget.currency)
  const totalLabel = formatMoney(budget.total, budget.currency)

  return (
    <span
      className={cn(
        'inline-flex max-w-full truncate rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.12px]',
        TONE_CLASS[budget.tone] || TONE_CLASS.neutral,
      )}
    >
      {budget.tone === 'final'
        ? `${spentLabel} • ${budget.label}`
        : `${spentLabel} / ${totalLabel} spent • ${budget.label}`}
    </span>
  )
}
