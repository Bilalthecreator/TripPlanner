import { useState } from 'react'
import { ACTIVITY_CATEGORIES } from '../../utils/tripHelpers.js'
import { cn } from '../../utils/cn.js'

const EMPTY = {
  title: '',
  category: 'Sightseeing',
  startTime: '',
  durationMinutes: 60,
  cost: 0,
  placeName: '',
  notes: '',
  dayId: '',
  completed: false,
}

export function ActivityForm({
  open,
  mode = 'create',
  dayLabel,
  days,
  initialValues,
  onClose,
  onSubmit,
}) {
  if (!open) return null

  return (
    <ActivityFormPanel
      key={`${mode}-${initialValues?.id || 'new'}-${initialValues?.dayId || ''}`}
      mode={mode}
      dayLabel={dayLabel}
      days={days}
      initialValues={initialValues}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
}

function ActivityFormPanel({
  mode,
  dayLabel,
  days,
  initialValues,
  onClose,
  onSubmit,
}) {
  const [values, setValues] = useState(() => ({
    ...EMPTY,
    ...initialValues,
    dayId: initialValues?.dayId || days?.[0]?.id || '',
  }))
  const [error, setError] = useState('')

  const setField = (key, value) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!values.title.trim()) {
      setError('Activity name is required.')
      return
    }
    if (!values.dayId) {
      setError('Choose a day for this activity.')
      return
    }
    onSubmit({
      ...values,
      title: values.title.trim(),
      durationMinutes: Number(values.durationMinutes) || 0,
      cost: Number(values.cost) || 0,
      startTime: values.startTime || null,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/35 p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close drawer"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-md flex-col bg-rw-surface shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3 border-b border-rw-divider/50 px-5 py-4">
          <div>
            <p className="text-[11px] font-bold tracking-[0.55px] text-rw-accent uppercase">
              Itinerary Builder
            </p>
            <h2 className="font-display text-lg font-semibold text-rw-ink">
              {mode === 'edit' ? 'Edit Activity' : `Add Activity to ${dayLabel}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-2 py-1 text-rw-muted hover:bg-rw-surface-muted"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4"
        >
          <label className="space-y-1.5">
            <span className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
              Activity Name
            </span>
            <input
              value={values.title}
              onChange={(e) => setField('title', e.target.value)}
              className={fieldClass()}
              placeholder="Tea Ceremony Camellia"
            />
          </label>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
              Category
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ACTIVITY_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setField('category', cat)}
                  className={cn(
                    'rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.4px] transition',
                    values.category === cat
                      ? 'bg-rw-accent text-white'
                      : 'bg-rw-surface-muted text-rw-muted hover:bg-rw-chip',
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5">
              <span className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
                Start Time
              </span>
              <input
                type="time"
                value={values.startTime || ''}
                onChange={(e) => setField('startTime', e.target.value)}
                className={fieldClass()}
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
                Duration (min)
              </span>
              <input
                type="number"
                min={0}
                step={15}
                value={values.durationMinutes}
                onChange={(e) => setField('durationMinutes', e.target.value)}
                className={fieldClass()}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5">
              <span className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
                Estimated Cost
              </span>
              <input
                type="number"
                min={0}
                value={values.cost}
                onChange={(e) => setField('cost', e.target.value)}
                className={fieldClass()}
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
                Assign Day
              </span>
              <select
                value={values.dayId}
                onChange={(e) => setField('dayId', e.target.value)}
                className={fieldClass()}
              >
                {(days || []).map((day, index) => (
                  <option key={day.id} value={day.id}>
                    Day {index + 1} — {day.title || day.date}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="space-y-1.5">
            <span className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
              Place
            </span>
            <input
              value={values.placeName}
              onChange={(e) => setField('placeName', e.target.value)}
              className={fieldClass()}
              placeholder="Neighborhood or venue"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
              Curator Notes & Tips
            </span>
            <textarea
              value={values.notes}
              onChange={(e) => setField('notes', e.target.value)}
              rows={4}
              className={cn(fieldClass(), 'resize-y')}
              placeholder="Add logistics, tips, or reminders…"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-rw-ink">
            <input
              type="checkbox"
              checked={Boolean(values.completed)}
              onChange={(e) => setField('completed', e.target.checked)}
              className="size-4 accent-[var(--color-rw-accent)]"
            />
            Mark as completed
          </label>

          <div className="rounded-2xl border border-rw-teal/25 bg-rw-teal/5 p-3 text-[12px] leading-5 text-rw-muted">
            <p className="font-bold tracking-[0.4px] text-rw-teal uppercase">
              RoamWise Routing Suggestion
            </p>
            <p className="mt-1">
              Keep a 20–30 minute buffer between timed stops so walking and
              transit don’t compress your day.
            </p>
          </div>

          {error ? <p className="text-[12px] text-rw-accent">{error}</p> : null}

          <div className="mt-auto flex gap-2 border-t border-rw-divider/50 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-rw-divider px-4 py-2.5 text-[13px] font-semibold text-rw-ink"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-full bg-rw-accent px-4 py-2.5 text-[13px] font-semibold text-white"
            >
              {mode === 'edit' ? 'Save Changes' : 'Save Activity'}
            </button>
          </div>
        </form>
      </aside>
    </div>
  )
}

function fieldClass() {
  return 'w-full rounded-xl border border-rw-divider/70 bg-rw-input px-3 py-2.5 text-sm text-rw-ink outline-none focus:border-rw-accent/60'
}
