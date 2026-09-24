import { useState } from 'react'
import { cn } from '../../utils/cn.js'
import { usePreferences } from '../../store/usePreferences.js'

const EMPTY_BASE = {
  name: '',
  destination: '',
  country: '',
  startDate: '',
  endDate: '',
  budget: 2000,
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

export function TripCreationForm({
  initialValues,
  submitLabel = 'Create Trip',
  onSubmit,
  onCancel,
  title = 'Create New Trip',
  description = 'Set the basics. Days are generated from your date range and you can build the itinerary next.',
}) {
  const { defaultTravelers, currency: prefCurrency } = usePreferences()
  const [values, setValues] = useState({
    ...EMPTY_BASE,
    travelers: defaultTravelers,
    currency: prefCurrency,
    ...initialValues,
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const setField = (key, value) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const validate = () => {
    const next = {}
    if (!values.name.trim()) next.name = 'Trip name is required.'
    if (!values.destination.trim()) next.destination = 'Destination is required.'
    if (!values.startDate) next.startDate = 'Start date is required.'
    if (!values.endDate) next.endDate = 'End date is required.'
    if (
      values.startDate &&
      values.endDate &&
      values.endDate < values.startDate
    ) {
      next.endDate = 'End date must be on or after the start date.'
    }
    const travelers = Number(values.travelers)
    if (!Number.isFinite(travelers) || travelers < 1 || travelers > 30) {
      next.travelers = 'Travelers must be between 1 and 30.'
    }
    const budget = Number(values.budget)
    if (!Number.isFinite(budget) || budget < 0) {
      next.budget = 'Enter a valid budget of 0 or more.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    try {
      await onSubmit({
        ...values,
        travelers: Number(values.travelers),
        budget: Number(values.budget),
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-2xl space-y-5 rounded-3xl bg-rw-surface p-6 shadow-sm sm:p-8"
    >
      <div>
        <h1 className="font-display text-2xl font-semibold text-rw-ink">
          {title}
        </h1>
        <p className="mt-1 text-sm text-rw-muted">{description}</p>
      </div>

      <Field label="Trip name" error={errors.name}>
        <input
          value={values.name}
          onChange={(e) => setField('name', e.target.value)}
          className={inputClass(errors.name)}
          placeholder="Autumn in Japan"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Destination" error={errors.destination}>
          <input
            value={values.destination}
            onChange={(e) => setField('destination', e.target.value)}
            className={inputClass(errors.destination)}
            placeholder="Kyoto"
          />
        </Field>
        <Field label="Country (optional)">
          <input
            value={values.country}
            onChange={(e) => setField('country', e.target.value)}
            className={inputClass()}
            placeholder="Japan"
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Start date" error={errors.startDate}>
          <input
            type="date"
            value={values.startDate}
            onChange={(e) => setField('startDate', e.target.value)}
            className={inputClass(errors.startDate)}
          />
        </Field>
        <Field label="End date" error={errors.endDate}>
          <input
            type="date"
            value={values.endDate}
            onChange={(e) => setField('endDate', e.target.value)}
            className={inputClass(errors.endDate)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Travelers" error={errors.travelers}>
          <input
            type="number"
            min={1}
            max={30}
            value={values.travelers}
            onChange={(e) => setField('travelers', e.target.value)}
            className={inputClass(errors.travelers)}
          />
        </Field>
        <Field label="Budget" error={errors.budget}>
          <div className="flex gap-2">
            <select
              value={values.currency}
              onChange={(e) => setField('currency', e.target.value)}
              className={cn(inputClass(), 'w-24 shrink-0')}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="JPY">JPY</option>
              <option value="GBP">GBP</option>
            </select>
            <input
              type="number"
              min={0}
              step={50}
              value={values.budget}
              onChange={(e) => setField('budget', e.target.value)}
              className={inputClass(errors.budget)}
            />
          </div>
        </Field>
      </div>

      <div className="flex flex-wrap justify-end gap-2 pt-2">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-rw-divider px-5 py-2 text-[13px] font-semibold text-rw-ink"
          >
            Cancel
          </button>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-rw-accent px-5 py-2 text-[13px] font-semibold text-white disabled:opacity-60"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
