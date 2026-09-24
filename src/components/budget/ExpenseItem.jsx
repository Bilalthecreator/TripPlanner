import { useState } from 'react'
import { formatMoney } from '../../utils/tripMetrics.js'
import {
  CATEGORY_COLORS,
  categoryLabel,
} from '../../utils/budgetUtils.js'
import { IconPencil, IconTrash } from '../common/Icons.jsx'
import { cn } from '../../utils/cn.js'

function formatExpenseDate(date) {
  if (!date) return 'No date'
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(`${date}T12:00:00`))
  } catch {
    return date
  }
}

export function ExpenseItem({ expense, currency, onEdit, onDelete }) {
  const [confirming, setConfirming] = useState(false)
  const displayCurrency = expense.currency || currency || 'USD'
  const color = CATEGORY_COLORS[expense.category] || '#94a3b8'

  return (
    <article className="rounded-2xl border border-rw-divider/50 bg-rw-surface p-4 shadow-sm transition hover:border-rw-divider">
      <div className="flex items-start gap-3">
        <span
          className="mt-1 size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-rw-ink">
                {expense.description || 'Untitled expense'}
              </h3>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-rw-muted">
                <span className="font-medium text-rw-ink/80">
                  {categoryLabel(expense.category)}
                </span>
                <span aria-hidden="true">·</span>
                <span>{formatExpenseDate(expense.date)}</span>
              </p>
            </div>
            <p className="shrink-0 font-display text-base font-semibold tabular-nums text-rw-ink">
              {formatMoney(expense.amount, displayCurrency)}
            </p>
          </div>

          {expense.notes ? (
            <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-rw-faint">
              {expense.notes}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {confirming ? (
              <>
                <span className="text-[12px] text-rw-muted">Delete this expense?</span>
                <button
                  type="button"
                  onClick={() => {
                    onDelete(expense.id)
                    setConfirming(false)
                  }}
                  className="rounded-full bg-rw-accent px-3 py-1 text-[12px] font-semibold text-white"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="rounded-full px-3 py-1 text-[12px] font-semibold text-rw-muted hover:bg-rw-surface-muted"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onEdit(expense)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold',
                    'text-rw-muted transition hover:bg-rw-surface-muted hover:text-rw-ink',
                  )}
                >
                  <IconPencil className="size-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold text-rw-muted transition hover:bg-rw-accent/10 hover:text-rw-accent"
                >
                  <IconTrash className="size-3.5" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
