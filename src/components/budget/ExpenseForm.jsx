import { useEffect, useState } from 'react'
import { cn } from '../../utils/cn.js'
import { CURRENCIES } from '../../data/preferences.js'
import { EXPENSE_CATEGORIES } from '../../utils/budgetUtils.js'
import { toISODate } from '../../utils/tripHelpers.js'

const EMPTY = {
  description: '',
  amount: '',
  currency: 'USD',
  category: 'food',
  date: toISODate(new Date()),
  notes: '',
}

function Field({ label, error, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
        {label}
      </span>
      {children}
      {error ? (
        <span className="block text-[12px] text-rw-accent">{error}</span>
      ) : null}
    </label>
  )
}

function inputClass(error) {
  return cn(
    'w-full rounded-xl border bg-rw-input px-3 py-2.5 text-sm text-rw-ink outline-none transition',
    error
      ? 'border-rw-accent'
      : 'border-rw-divider/70 focus:border-rw-accent/60',
  )
}

function validate(values) {
  const errors = {}
  if (!values.description.trim()) {
    errors.description = 'Description is required.'
  }

  const amount = Number(values.amount)
  if (values.amount === '' || !Number.isFinite(amount)) {
    errors.amount = 'Enter a valid amount.'
  } else if (amount < 0) {
    errors.amount = 'Amount cannot be negative.'
  }

  if (!values.category) {
    errors.category = 'Category is required.'
  }

  if (!values.date || Number.isNaN(Date.parse(`${values.date}T12:00:00`))) {
    errors.date = 'Enter a valid date.'
  }

  const currencyOk = CURRENCIES.some((c) => c.id === values.currency)
  if (!currencyOk) {
    errors.currency = 'Select a valid currency.'
  }

  return errors
}

export function ExpenseForm({
  mode = 'add',
  initialValues,
  defaultCurrency = 'USD',
  onSubmit,
  onCancel,
}) {
  const [values, setValues] = useState(() => ({
    ...EMPTY,
    currency: defaultCurrency,
    ...initialValues,
    amount:
      initialValues?.amount != null && initialValues.amount !== ''
        ? String(initialValues.amount)
        : '',
  }))
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setValues({
      ...EMPTY,
      currency: defaultCurrency,
      ...initialValues,
      amount:
        initialValues?.amount != null && initialValues.amount !== ''
          ? String(initialValues.amount)
          : '',
    })
    setErrors({})
  }, [initialValues, defaultCurrency, mode])

  const setField = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSubmit({
      description: values.description.trim(),
      amount: Number(values.amount),
      currency: values.currency,
      category: values.category,
      date: values.date,
      notes: values.notes.trim(),
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-rw-divider/60 bg-rw-surface p-5 shadow-sm"
      noValidate
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-rw-ink">
            {mode === 'edit' ? 'Edit expense' : 'Add expense'}
          </h2>
          <p className="mt-0.5 text-sm text-rw-muted">
            Track spending against this trip’s budget.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Description" error={errors.description}>
          <input
            type="text"
            value={values.description}
            onChange={(e) => setField('description', e.target.value)}
            className={inputClass(errors.description)}
            placeholder="e.g. Hotel night, lunch, metro pass"
          />
        </Field>

        <Field label="Amount" error={errors.amount}>
          <input
            type="number"
            min="0"
            step="0.01"
            value={values.amount}
            onChange={(e) => setField('amount', e.target.value)}
            className={inputClass(errors.amount)}
            placeholder="0"
          />
        </Field>

        <Field label="Category" error={errors.category}>
          <select
            value={values.category}
            onChange={(e) => setField('category', e.target.value)}
            className={inputClass(errors.category)}
          >
            {EXPENSE_CATEGORIES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Currency" error={errors.currency}>
          <select
            value={values.currency}
            onChange={(e) => setField('currency', e.target.value)}
            className={inputClass(errors.currency)}
          >
            {CURRENCIES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Date" error={errors.date}>
          <input
            type="date"
            value={values.date}
            onChange={(e) => setField('date', e.target.value)}
            className={inputClass(errors.date)}
          />
        </Field>

        <Field label="Notes">
          <input
            type="text"
            value={values.notes}
            onChange={(e) => setField('notes', e.target.value)}
            className={inputClass(false)}
            placeholder="Optional details"
          />
        </Field>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="submit"
          className="rounded-full bg-rw-accent px-5 py-2.5 text-[13px] font-semibold tracking-[0.26px] text-white shadow-[0_4px_12px_-4px_rgba(185,5,56,0.35)] transition hover:brightness-110"
        >
          {mode === 'edit' ? 'Save changes' : 'Save expense'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-5 py-2.5 text-[13px] font-semibold tracking-[0.26px] text-rw-muted transition hover:bg-rw-surface-muted hover:text-rw-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
