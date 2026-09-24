import { EmptyState } from '../common/StatusBlocks.jsx'

export function BudgetEmptyState({ onAdd }) {
  return (
    <EmptyState
      title="No expenses yet"
      message="Log flights, stays, meals, and activities to see totals, remaining budget, and category breakdown for this trip."
      actionLabel="Add expense"
      onAction={onAdd}
      className="border-dashed"
    />
  )
}
