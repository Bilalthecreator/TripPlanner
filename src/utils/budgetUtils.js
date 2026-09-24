import {
  EXPENSE_CATEGORIES,
  normalizeExpense,
  normalizeExpenseCategory,
} from './tripHelpers.js'
import { formatMoney } from './tripMetrics.js'

export { EXPENSE_CATEGORIES }

export const EXPENSE_SORTS = [
  { id: 'newest', label: 'Newest' },
  { id: 'oldest', label: 'Oldest' },
  { id: 'amount-desc', label: 'Amount: high → low' },
  { id: 'amount-asc', label: 'Amount: low → high' },
]

export function getTripExpenses(trip) {
  return (trip?.expenses || []).map((expense) =>
    normalizeExpense(expense, trip?.budget?.currency),
  )
}

export function sumExpenses(expenses) {
  return (expenses || []).reduce(
    (sum, expense) => sum + (Number(expense.amount) || 0),
    0,
  )
}

export function getBudgetSummary(trip, displayCurrency) {
  const expenses = getTripExpenses(trip)
  const totalBudget = Number(trip?.budget?.total) || 0
  const currency =
    displayCurrency || trip?.budget?.currency || expenses[0]?.currency || 'USD'
  const totalSpent = sumExpenses(expenses)
  const remaining = totalBudget - totalSpent
  const percentUsed =
    totalBudget > 0
      ? Math.min(100, Math.round((totalSpent / totalBudget) * 100))
      : 0

  let tone = 'neutral'
  if (totalBudget <= 0) tone = 'neutral'
  else if (remaining < 0) tone = 'danger'
  else if (percentUsed >= 90) tone = 'warn'
  else if (percentUsed >= 55) tone = 'ok'
  else tone = 'good'

  return {
    currency,
    totalBudget,
    totalSpent,
    remaining,
    percentUsed,
    tone,
    expenseCount: expenses.length,
    totalBudgetLabel: formatMoney(totalBudget, currency),
    totalSpentLabel: formatMoney(totalSpent, currency),
    remainingLabel: formatMoney(remaining, currency),
  }
}

export function getCategoryBreakdown(expenses, currency = 'USD') {
  const list = expenses || []
  const total = sumExpenses(list)
  const byCategory = new Map(
    EXPENSE_CATEGORIES.map((c) => [c.id, { ...c, amount: 0, count: 0 }]),
  )

  for (const expense of list) {
    const id = normalizeExpenseCategory(expense.category)
    const bucket = byCategory.get(id) || {
      id,
      label: id,
      amount: 0,
      count: 0,
    }
    bucket.amount += Number(expense.amount) || 0
    bucket.count += 1
    byCategory.set(id, bucket)
  }

  return [...byCategory.values()]
    .filter((item) => item.amount > 0)
    .map((item) => ({
      ...item,
      percent: total > 0 ? Math.round((item.amount / total) * 100) : 0,
      amountLabel: formatMoney(item.amount, currency),
    }))
    .sort((a, b) => b.amount - a.amount)
}

export function filterAndSortExpenses(
  expenses,
  { category = 'all', sort = 'newest', query = '' } = {},
) {
  let next = [...(expenses || [])]

  if (category && category !== 'all') {
    const cat = normalizeExpenseCategory(category)
    next = next.filter(
      (expense) => normalizeExpenseCategory(expense.category) === cat,
    )
  }

  const q = query.trim().toLowerCase()
  if (q) {
    next = next.filter((expense) =>
      [expense.description, expense.notes, expense.category]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }

  next.sort((a, b) => {
    switch (sort) {
      case 'oldest':
        return String(a.date).localeCompare(String(b.date))
      case 'amount-desc':
        return (Number(b.amount) || 0) - (Number(a.amount) || 0)
      case 'amount-asc':
        return (Number(a.amount) || 0) - (Number(b.amount) || 0)
      case 'newest':
      default:
        return String(b.date).localeCompare(String(a.date))
    }
  })

  return next
}

export function categoryLabel(categoryId) {
  const id = normalizeExpenseCategory(categoryId)
  return EXPENSE_CATEGORIES.find((c) => c.id === id)?.label || id
}

export const CATEGORY_COLORS = {
  accommodation: '#e11d48',
  food: '#f59e0b',
  transportation: '#0d9488',
  activities: '#6366f1',
  shopping: '#ec4899',
  miscellaneous: '#94a3b8',
}
