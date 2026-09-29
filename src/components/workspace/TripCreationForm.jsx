import { useState } from 'react'
import { cn } from '../../utils/cn.js'
import { usePreferences } from '../../store/usePreferences.js'
import { getDestinationImage } from '../../services/wikimediaService.js'
import { DestinationSearchField } from './DestinationSearchField.jsx'

const EMPTY_BASE = {
  name: '',
  destination: '',
  country: '',
  region: '',
  destinationId: null,
  placeId: null,
  latitude: null,
  longitude: null,
  coverImage: null,
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

  const handleDestinationText = (text) => {
    setValues((prev) => ({
      ...prev,
      destination: text,
      // Clear geo metadata when the user types freely after a selection.
      destinationId: null,
      placeId: null,
      latitude: null,
      longitude: null,
      coverImage: null,
      region: '',
    }))
  }

  const handleDestinationSelect = async (item) => {
    setValues((prev) => ({
      ...prev,
      destination: item.name || prev.destination,
      country: item.country || prev.country,
      region: item.region || '',
      destinationId: item.id || null,
      placeId: item.placeId || null,
      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,
    }))

    // Best-effort Wikimedia cover — never blocks create/save.
    try {
      const image = await getDestinationImage(
        [item.name, item.country].filter(Boolean).join(', '),
      )
      if (image?.url) {
        setValues((prev) => ({
          ...prev,
          coverImage: image.url,
        }))
      }
    } catch {
      // ignore image enrichment failures
    }
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
        <div className="block space-y-1.5">
          <span className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
            Destination
          </span>
          <DestinationSearchField
            value={values.destination}
            country={values.country}
            error={errors.destination}
            onChange={handleDestinationText}
            onSelect={handleDestinationSelect}
            inputClassName={inputClass(errors.destination)}
          />
          {values.latitude != null && values.longitude != null ? (
            <p className="text-[11px] text-rw-teal">
              Mapped · {Number(values.latitude).toFixed(3)},{' '}
              {Number(values.longitude).toFixed(3)}
            </p>
          ) : (
            <p className="text-[11px] text-rw-muted">
              Select a suggestion for map/weather enrichment, or keep a typed name.
            </p>
          )}
        </div>
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

      <div className="grid gap-4 sm:grid-cols-3">
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
        <div className="sm:col-span-2">
          <Field label="Total trip budget" error={errors.budget}>
            <div className="flex gap-2">
              <select
                value={values.currency}
                onChange={(e) => setField('currency', e.target.value)}
                aria-label="Budget currency"
                className={cn(inputClass(), 'w-28 shrink-0')}
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
                inputMode="decimal"
                placeholder="e.g. 2500"
                value={values.budget}
                onChange={(e) => setField('budget', e.target.value)}
                className={cn(inputClass(errors.budget), 'min-w-0 flex-1')}
              />
            </div>
          </Field>
        </div>
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
