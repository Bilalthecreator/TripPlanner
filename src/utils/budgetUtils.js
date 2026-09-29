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

const ACTIVITY_CATEGORY_TO_EXPENSE = {
  'Food & Dining': 'food',
  Transit: 'transportation',
  Sightseeing: 'activities',
  Cultural: 'activities',
  Relaxation: 'activities',
}

/**
 * Turn itinerary activity costs into budget line items so Budget page
 * stays in sync with workspace “budget burn”.
 */
export function getActivityDerivedExpenses(trip) {
  const currency = trip?.budget?.currency || 'USD'
  const items = []

  for (const day of trip?.days || []) {
    for (const activity of day.activities || []) {
      const cost = Number(activity.cost)
      if (!Number.isFinite(cost) || cost <= 0) continue

      items.push(
        normalizeExpense(
          {
            id: `act-exp-${activity.id}`,
            description: activity.title || 'Activity',
            amount: cost,
            currency,
            category:
              ACTIVITY_CATEGORY_TO_EXPENSE[activity.category] || 'activities',
            date: day.date || trip.startDate,
            notes: 'From itinerary activity',
            source: 'activity',
            activityId: activity.id,
            dayId: day.id,
            readOnly: true,
          },
          currency,
        ),
      )
    }
  }

  return items
}

export function getTripExpenses(trip) {
  const manual = (trip?.expenses || []).map((expense) =>
    normalizeExpense(expense, trip?.budget?.currency),
  )
  return [...getActivityDerivedExpenses(trip), ...manual]
}

/**
 * Attach displayAmount without mutating the stored amount/currency.
 * convert(amount, fromCurrency) → number | null
 * ratesStatus: 'ready' | 'pending' | 'failed' | 'idle'
 */
export function withDisplayAmounts(
  expenses,
  displayCurrency,
  convert,
  { ratesStatus = 'ready' } = {},
) {
  const display = String(displayCurrency || 'USD').toUpperCase()
  return (expenses || []).map((expense) => {
    const amount = Number(expense.amount) || 0
    const currency = String(expense.currency || display).toUpperCase()
    let displayAmount
    let conversionAvailable = true

    if (currency === display) {
      displayAmount = amount
    } else if (ratesStatus === 'pending' || ratesStatus === 'idle') {
      // Keep original amount; UI must not pretend it was converted yet.
      displayAmount = amount
      conversionAvailable = true
    } else if (typeof convert !== 'function' || ratesStatus === 'failed') {
      displayAmount = amount
      conversionAvailable = false
    } else {
      const converted = convert(amount, currency)
      if (converted == null || !Number.isFinite(converted)) {
        displayAmount = amount
        conversionAvailable = false
      } else {
        displayAmount = converted
      }
    }

    const converted =
      currency !== display &&
      ratesStatus === 'ready' &&
      conversionAvailable

    return {
      ...expense,
      amount,
      currency,
      displayAmount,
      displayCurrency: converted ? display : currency,
      conversionAvailable,
      conversionPending:
        currency !== display &&
        (ratesStatus === 'pending' || ratesStatus === 'idle'),
    }
  })
}

export function sumDisplayAmounts(expenses) {
  return (expenses || []).reduce(
    (sum, expense) =>
      sum + (Number(expense.displayAmount ?? expense.amount) || 0),
    0,
  )
}

export function sumExpenses(expenses) {
  return (expenses || []).reduce(
    (sum, expense) => sum + (Number(expense.amount) || 0),
    0,
  )
}

function convertMoney(
  amount,
  fromCurrency,
  displayCurrency,
  convert,
  ratesStatus = 'ready',
) {
  const value = Number(amount) || 0
  const from = String(fromCurrency || displayCurrency).toUpperCase()
  const display = String(displayCurrency || 'USD').toUpperCase()
  if (from === display) {
    return { value, currency: display, conversionAvailable: true, pending: false }
  }
  if (ratesStatus === 'pending' || ratesStatus === 'idle') {
    return {
      value,
      currency: from,
      conversionAvailable: true,
      pending: true,
    }
  }
  if (typeof convert !== 'function' || ratesStatus === 'failed') {
    return {
      value,
      currency: from,
      conversionAvailable: false,
      pending: false,
    }
  }
  const converted = convert(value, from)
  if (converted == null || !Number.isFinite(converted)) {
    return {
      value,
      currency: from,
      conversionAvailable: false,
      pending: false,
    }
  }
  return {
    value: converted,
    currency: display,
    conversionAvailable: true,
    pending: false,
  }
}

export function getBudgetSummary(
  trip,
  displayCurrency,
  { convert, ratesStatus = 'ready' } = {},
) {
  const display = String(
    displayCurrency || trip?.budget?.currency || 'USD',
  ).toUpperCase()
  const expenses = withDisplayAmounts(
    getTripExpenses(trip),
    display,
    convert,
    { ratesStatus },
  )
  const budgetCurrency = String(
    trip?.budget?.currency || display,
  ).toUpperCase()
  const budgetResult = convertMoney(
    Number(trip?.budget?.total) || 0,
    budgetCurrency,
    display,
    convert,
    ratesStatus,
  )

  const pending =
    budgetResult.pending || expenses.some((e) => e.conversionPending)
  const labelCurrency = pending
    ? budgetCurrency
    : budgetResult.conversionAvailable === false
      ? budgetCurrency
      : display

  // While pending/failed, sum in stored amounts (same units as labelCurrency when
  // budget + expenses share a currency; otherwise still original per-expense).
  const totalBudget = budgetResult.value
  const totalSpent = pending
    ? sumExpenses(expenses)
    : sumDisplayAmounts(expenses)
  const remaining = totalBudget - totalSpent
  const percentUsed =
    totalBudget > 0
      ? Math.min(100, Math.round((totalSpent / totalBudget) * 100))
      : 0

  let tone = 'good'
  if (totalBudget <= 0) tone = 'neutral'
  else if (remaining < 0) tone = 'danger'
  else if (percentUsed >= 90) tone = 'warn'
  else if (percentUsed >= 55) tone = 'ok'

  const conversionAvailable =
    !pending &&
    budgetResult.conversionAvailable &&
    expenses.every((e) => e.conversionAvailable !== false)

  return {
    currency: labelCurrency,
    totalBudget,
    totalSpent,
    remaining,
    percentUsed,
    tone,
    expenseCount: expenses.length,
    conversionAvailable,
    conversionPending: pending,
    totalBudgetLabel: formatMoney(totalBudget, labelCurrency),
    totalSpentLabel: formatMoney(totalSpent, labelCurrency),
    remainingLabel: formatMoney(remaining, labelCurrency),
  }
}

export function getCategoryBreakdown(
  expenses,
  currency = 'USD',
  { convert, ratesStatus = 'ready' } = {},
) {
  const display = String(currency || 'USD').toUpperCase()
  const list = withDisplayAmounts(expenses, display, convert, { ratesStatus })
  const pending = list.some((e) => e.conversionPending)
  const useConverted = ratesStatus === 'ready' && !pending
  const total = useConverted ? sumDisplayAmounts(list) : sumExpenses(list)
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
    bucket.amount += useConverted
      ? Number(expense.displayAmount) || 0
      : Number(expense.amount) || 0
    bucket.count += 1
    byCategory.set(id, bucket)
  }

  const conversionAvailable =
    !pending && list.every((e) => e.conversionAvailable !== false)
  const fallbackCurrency =
    list.find((e) => e.currency)?.currency || display

  return [...byCategory.values()]
    .filter((item) => item.amount > 0)
    .map((item) => ({
      ...item,
      percent: total > 0 ? Math.round((item.amount / total) * 100) : 0,
      amountLabel: formatMoney(
        item.amount,
        useConverted && conversionAvailable ? display : fallbackCurrency,
      ),
      conversionAvailable,
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
    const amountA = Number(a.displayAmount ?? a.amount) || 0
    const amountB = Number(b.displayAmount ?? b.amount) || 0
    switch (sort) {
      case 'oldest':
        return String(a.date).localeCompare(String(b.date))
      case 'amount-desc':
        return amountB - amountA
      case 'amount-asc':
        return amountA - amountB
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
