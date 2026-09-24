import { EXPENSE_SORTS } from '../../utils/budgetUtils.js'

export function ExpenseSort({ sort, onSortChange }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-rw-muted">
      <span className="shrink-0 text-[11px] font-bold tracking-[0.55px] uppercase">
        Sort
      </span>
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value)}
        className="rounded-xl border border-rw-divider/70 bg-rw-input px-3 py-2 text-sm font-medium text-rw-ink outline-none transition focus:border-rw-accent/60"
      >
        {EXPENSE_SORTS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
