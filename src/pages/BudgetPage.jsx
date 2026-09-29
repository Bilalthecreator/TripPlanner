import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useTrips } from '../store/useTrips.js'
import { usePreferences } from '../store/usePreferences.js'
import { useAsyncResource } from '../hooks/useAsyncResource.js'
import { useCurrencyConversion } from '../hooks/useCurrencyConversion.js'
import { budgetService } from '../services/budgetService.js'
import { ErrorBoundary } from '../components/common/ErrorBoundary.jsx'
import { EmptyState } from '../components/common/StatusBlocks.jsx'
import { IconPlus } from '../components/common/Icons.jsx'
import { BudgetSummary } from '../components/budget/BudgetSummary.jsx'
import { CategoryBreakdown } from '../components/budget/CategoryBreakdown.jsx'
import { ExpenseFilters } from '../components/budget/ExpenseFilters.jsx'
import { ExpenseSort } from '../components/budget/ExpenseSort.jsx'
import { ExpenseList } from '../components/budget/ExpenseList.jsx'
import { ExpenseForm } from '../components/budget/ExpenseForm.jsx'
import { BudgetSkeleton } from '../components/budget/BudgetSkeleton.jsx'
import { BudgetEmptyState } from '../components/budget/BudgetEmptyState.jsx'
import { BudgetErrorState } from '../components/budget/BudgetErrorState.jsx'
import {
  EXPENSE_CATEGORIES,
  EXPENSE_SORTS,
  filterAndSortExpenses,
  getBudgetSummary,
  getCategoryBreakdown,
  getTripExpenses,
  withDisplayAmounts,
} from '../utils/budgetUtils.js'
import { toISODate } from '../utils/tripHelpers.js'

const VALID_CATEGORIES = new Set([
  'all',
  ...EXPENSE_CATEGORIES.map((c) => c.id),
])
const VALID_SORTS = new Set(EXPENSE_SORTS.map((s) => s.id))

export function BudgetPage() {
  return (
    <ErrorBoundary>
      <BudgetPageInner />
    </ErrorBoundary>
  )
}

function BudgetPageInner() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const tripsApi = useTrips()
  const { currency: prefCurrency, preferences } = usePreferences()
  const [searchParams, setSearchParams] = useSearchParams()

  const categoryParam = searchParams.get('category') || 'all'
  const sortParam = searchParams.get('sort') || 'newest'
  const category = VALID_CATEGORIES.has(categoryParam) ? categoryParam : 'all'
  const sort = VALID_SORTS.has(sortParam) ? sortParam : 'newest'
  const [query, setQuery] = useState('')

  const [formMode, setFormMode] = useState(null)
  const [editingExpense, setEditingExpense] = useState(null)

  const load = useAsyncResource(
    async (signal) => budgetService.loadBudget(tripId, { signal }),
    [tripId],
    { enabled: Boolean(tripId) },
  )

  const liveTrip = tripsApi.getTrip(tripId)

  const patchParams = useCallback(
    (patch) => {
      const next = new URLSearchParams(searchParams)
      if ('category' in patch) {
        if (!patch.category || patch.category === 'all') next.delete('category')
        else next.set('category', patch.category)
      }
      if ('sort' in patch) {
        if (!patch.sort || patch.sort === 'newest') next.delete('sort')
        else next.set('sort', patch.sort)
      }
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const displayCurrency = prefCurrency || liveTrip?.budget?.currency || 'USD'

  const expenses = useMemo(
    () => (liveTrip ? getTripExpenses(liveTrip) : []),
    [liveTrip],
  )

  const sourceCurrencies = useMemo(() => {
    const codes = expenses.map((e) => e.currency)
    if (liveTrip?.budget?.currency) codes.push(liveTrip.budget.currency)
    return codes
  }, [expenses, liveTrip])

  const conversionEnabled = preferences?.automation?.currencyConvert !== false

  const fx = useCurrencyConversion({
    displayCurrency,
    sourceCurrencies,
    enabled: conversionEnabled && Boolean(liveTrip),
  })

  const ratesStatus = !conversionEnabled
    ? 'idle'
    : fx.status === 'loading'
      ? 'pending'
      : fx.status === 'error'
        ? 'failed'
        : fx.status === 'success'
          ? 'ready'
          : 'idle'

  const convert =
    conversionEnabled && ratesStatus === 'ready' ? fx.convert : undefined

  const displayExpenses = useMemo(
    () =>
      withDisplayAmounts(expenses, displayCurrency, convert, { ratesStatus }),
    [expenses, displayCurrency, convert, ratesStatus],
  )

  const summary = useMemo(
    () =>
      liveTrip
        ? getBudgetSummary(liveTrip, displayCurrency, {
            convert,
            ratesStatus,
          })
        : null,
    [liveTrip, displayCurrency, convert, ratesStatus],
  )

  const breakdown = useMemo(() => {
    try {
      return getCategoryBreakdown(expenses, displayCurrency, {
        convert,
        ratesStatus,
      })
    } catch {
      return null
    }
  }, [expenses, displayCurrency, convert, ratesStatus])

  const visibleExpenses = useMemo(
    () =>
      filterAndSortExpenses(displayExpenses, { category, sort, query }),
    [displayExpenses, category, sort, query],
  )

  const conversionUnavailable =
    Boolean(liveTrip) &&
    fx.needed &&
    (fx.status === 'error' ||
      (fx.status === 'success' &&
        (fx.missing?.length > 0 || summary?.conversionAvailable === false)))

  const openAdd = () => {
    setEditingExpense(null)
    setFormMode('add')
  }

  const openEdit = (expense) => {
    if (expense?.source === 'activity' || expense?.readOnly) return
    setEditingExpense(expense)
    setFormMode('edit')
  }

  const closeForm = () => {
    setFormMode(null)
    setEditingExpense(null)
  }

  const handleSave = (payload) => {
    if (!tripId) return
    if (formMode === 'edit' && editingExpense?.id) {
      tripsApi.updateExpense(tripId, editingExpense.id, payload)
    } else {
      tripsApi.addExpense(tripId, payload)
    }
    closeForm()
  }

  const handleDelete = (expenseId) => {
    if (String(expenseId || '').startsWith('act-exp-')) return
    tripsApi.deleteExpense(tripId, expenseId)
    if (editingExpense?.id === expenseId) closeForm()
  }

  if (!tripId) {
    return (
      <EmptyState
        title="Trip not found"
        message="This budget link is missing a trip id."
        actionLabel="Back to Trips"
        onAction={() => navigate('/trips')}
      />
    )
  }

  // Local trip data — only skeleton when trip is not yet in the store.
  if (
    !liveTrip &&
    (load.status === 'loading' || load.status === 'idle')
  ) {
    return <BudgetSkeleton />
  }

  if (load.status === 'error' && load.error?.code === 'NOT_FOUND' && !liveTrip) {
    return (
      <EmptyState
        title="Trip not found"
        message="This trip may have been deleted or the link is incorrect."
        actionLabel="Back to Trips"
        onAction={() => navigate('/trips')}
      />
    )
  }

  if (load.status === 'error' && !liveTrip) {
    return (
      <BudgetErrorState message={load.error?.message} onRetry={load.retry} />
    )
  }

  if (!liveTrip) {
    return (
      <EmptyState
        title="Trip not found"
        message="This trip may have been deleted or the link is incorrect."
        actionLabel="Back to Trips"
        onAction={() => navigate('/trips')}
      />
    )
  }

  const hasAnyExpenses = expenses.length > 0
  const filtered = category !== 'all' || Boolean(query.trim())

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
          <Link to="/trips" className="hover:text-rw-accent">
            Trips
          </Link>
          <span>/</span>
          <Link to={`/trips/${tripId}`} className="hover:text-rw-accent">
            {liveTrip.name}
          </Link>
          <span>/</span>
          <span className="text-rw-ink">Budget</span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-[11px] font-bold tracking-[0.55px] text-rw-accent uppercase">
              Expense management
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-[-0.45px] text-rw-ink">
              Budget
            </h1>
            <p className="max-w-xl text-sm leading-[22px] text-rw-muted">
              Track spending for {liveTrip.name}. Totals include logged expenses
              and itinerary activity costs. The trip budget cap is editable
              below.
            </p>
          </div>

          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-rw-accent px-5 py-2.5 text-[13px] font-semibold tracking-[0.26px] text-white shadow-[0_4px_12px_-4px_rgba(185,5,56,0.35)] transition hover:brightness-110"
          >
            <IconPlus />
            Add expense
          </button>
        </div>
      </header>

      {fx.needed && fx.status === 'loading' ? (
        <p
          className="rounded-2xl border border-rw-divider/50 bg-rw-surface-soft px-4 py-2.5 text-[13px] text-rw-muted"
          role="status"
        >
          Updating exchange rates for {displayCurrency}…
        </p>
      ) : null}

      {conversionUnavailable ? (
        <p
          className="rounded-2xl border border-rw-divider/50 bg-rw-surface-soft px-4 py-2.5 text-[13px] text-rw-muted"
          role="status"
        >
          Currency conversion unavailable
          {fx.missing?.length
            ? ` for ${fx.missing.join(', ')}`
            : ''}
          . Showing original amounts. Expenses are unchanged.
          {fx.status === 'error' ? (
            <>
              {' '}
              <button
                type="button"
                onClick={fx.retry}
                className="font-semibold text-rw-accent hover:underline"
              >
                Retry
              </button>
            </>
          ) : null}
        </p>
      ) : null}

      {summary ? <BudgetSummary summary={summary} /> : null}

      <BudgetCapEditor
        total={liveTrip.budget?.total || 0}
        currency={liveTrip.budget?.currency || displayCurrency}
        onSave={({ total, currency }) => {
          tripsApi.setBudget(tripId, { total, currency })
        }}
      />

      {breakdown ? (
        <CategoryBreakdown
          breakdown={breakdown}
          totalLabel={summary?.totalSpentLabel}
          currency={displayCurrency}
        />
      ) : (
        <section className="rounded-3xl border border-dashed border-rw-divider/70 bg-rw-surface-soft p-5 text-sm text-rw-muted">
          Category breakdown is unavailable right now. Expense list and totals
          still work.
        </section>
      )}

      {formMode ? (
        <ExpenseForm
          key={editingExpense?.id || 'new'}
          mode={formMode}
          defaultCurrency={
            liveTrip.budget?.currency || prefCurrency || 'USD'
          }
          initialValues={
            editingExpense
              ? {
                  description: editingExpense.description,
                  amount: editingExpense.amount,
                  currency: editingExpense.currency,
                  category: editingExpense.category,
                  date: editingExpense.date,
                  notes: editingExpense.notes,
                }
              : {
                  date: toISODate(new Date()),
                  currency: liveTrip.budget?.currency || prefCurrency || 'USD',
                }
          }
          onSubmit={handleSave}
          onCancel={closeForm}
        />
      ) : null}

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-rw-ink">
              Expenses
            </h2>
            <p className="text-sm text-rw-muted">
              {visibleExpenses.length} shown
              {filtered ? ' (filtered)' : ''}
            </p>
          </div>
          <ExpenseSort
            sort={sort}
            onSortChange={(value) => patchParams({ sort: value })}
          />
        </div>

        <ExpenseFilters
          category={category}
          onCategoryChange={(value) => patchParams({ category: value })}
          query={query}
          onQueryChange={setQuery}
        />

        {!hasAnyExpenses && !formMode ? (
          <BudgetEmptyState onAdd={openAdd} />
        ) : (
          <ExpenseList
            expenses={visibleExpenses}
            currency={displayCurrency}
            onEdit={openEdit}
            onDelete={handleDelete}
            filtered={filtered}
          />
        )}
      </section>
    </div>
  )
}

function BudgetCapEditor({ total, currency, onSave }) {
  const [draftTotal, setDraftTotal] = useState(String(total ?? 0))
  const [draftCurrency, setDraftCurrency] = useState(currency || 'USD')
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    setDraftTotal(String(total ?? 0))
    setDraftCurrency(currency || 'USD')
  }, [total, currency])

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextTotal = Number(draftTotal)
    if (!Number.isFinite(nextTotal) || nextTotal < 0) return
    onSave?.({ total: nextTotal, currency: draftCurrency })
    setSavedFlash(true)
    window.setTimeout(() => setSavedFlash(false), 1600)
  }

  return (
    <section
      aria-label="Trip budget cap"
      className="rounded-3xl border border-rw-divider/60 bg-rw-surface p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-rw-ink">
            Trip budget cap
          </h2>
          <p className="mt-1 text-[13px] text-rw-muted">
            This is the spending limit for the trip — not a sample value. Change
            it anytime.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex w-full flex-wrap items-end gap-2 sm:w-auto"
        >
          <label className="block space-y-1">
            <span className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
              Currency
            </span>
            <select
              value={draftCurrency}
              onChange={(e) => setDraftCurrency(e.target.value)}
              className="rounded-xl border border-rw-divider/70 bg-rw-input px-3 py-2.5 text-sm text-rw-ink outline-none"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="JPY">JPY</option>
              <option value="GBP">GBP</option>
            </select>
          </label>
          <label className="block min-w-[10rem] flex-1 space-y-1 sm:min-w-[12rem]">
            <span className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
              Total budget
            </span>
            <input
              type="number"
              min={0}
              step={50}
              inputMode="decimal"
              value={draftTotal}
              onChange={(e) => setDraftTotal(e.target.value)}
              className="w-full rounded-xl border border-rw-divider/70 bg-rw-input px-3 py-2.5 text-sm text-rw-ink outline-none"
            />
          </label>
          <button
            type="submit"
            className="rounded-full bg-rw-accent px-5 py-2.5 text-[13px] font-semibold text-white transition hover:brightness-110"
          >
            {savedFlash ? 'Saved' : 'Update cap'}
          </button>
        </form>
      </div>
    </section>
  )
}
