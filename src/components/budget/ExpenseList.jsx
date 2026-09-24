import { ExpenseItem } from './ExpenseItem.jsx'
import { SkeletonBlock } from '../common/StatusBlocks.jsx'

export function ExpenseList({
  expenses,
  currency,
  onEdit,
  onDelete,
  filtered,
}) {
  if (!expenses.length) {
    return (
      <p className="rounded-2xl border border-dashed border-rw-divider/70 bg-rw-surface-soft px-4 py-8 text-center text-sm text-rw-muted">
        {filtered
          ? 'No expenses match the current filters.'
          : 'No expenses yet.'}
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-3">
      {expenses.map((expense) => (
        <li key={expense.id}>
          <ExpenseItem
            expense={expense}
            currency={currency}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  )
}

export function ExpenseListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl border border-rw-divider/40 bg-rw-surface p-4"
        >
          <div className="flex justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-2/3" />
              <SkeletonBlock className="h-3 w-1/3" />
            </div>
            <SkeletonBlock className="h-5 w-16" />
          </div>
          <SkeletonBlock className="mt-3 h-3 w-full" />
        </div>
      ))}
    </div>
  )
}
