import { useState } from 'react'
import { formatMoney } from '../../utils/tripMetrics.js'
import { getDayActivityCost } from '../../utils/workspaceStats.js'
import { IconPlus } from '../common/Icons.jsx'
import { ActivityCard } from './ActivityCard.jsx'
import { ActivityForm } from './ActivityForm.jsx'
import { DaySelector } from './DaySelector.jsx'

export function ItineraryBuilder({ trip, tripsApi }) {
  const days = trip.days || []
  const [selectedDayId, setSelectedDayId] = useState(days[0]?.id || null)
  const [drawer, setDrawer] = useState({
    open: false,
    mode: 'create',
    activity: null,
  })

  const resolvedDayId =
    selectedDayId && days.some((d) => d.id === selectedDayId)
      ? selectedDayId
      : days[0]?.id || null

  const selectedDay = days.find((d) => d.id === resolvedDayId) || null
  const activities = selectedDay?.activities || []
  const nextId = activities.find((a) => !a.completed)?.id

  const dayOptions = days.map((day, index) => ({
    id: day.id,
    label: `Day ${index + 1} — ${day.title || day.date}`,
    disabled: day.id === selectedDay?.id,
  }))

  const openCreate = () =>
    setDrawer({
      open: true,
      mode: 'create',
      activity: { dayId: selectedDay?.id },
    })

  const openEdit = (activity) =>
    setDrawer({
      open: true,
      mode: 'edit',
      activity: { ...activity, dayId: selectedDay.id },
    })

  const closeDrawer = () =>
    setDrawer({ open: false, mode: 'create', activity: null })

  const handleSave = (values) => {
    if (drawer.mode === 'edit' && drawer.activity?.id) {
      const fromDayId = selectedDay.id
      const toDayId = values.dayId
      if (toDayId !== fromDayId) {
        tripsApi.moveActivity(trip.id, fromDayId, toDayId, drawer.activity.id)
        tripsApi.updateActivity(trip.id, toDayId, drawer.activity.id, values)
        setSelectedDayId(toDayId)
      } else {
        tripsApi.updateActivity(
          trip.id,
          fromDayId,
          drawer.activity.id,
          values,
        )
      }
    } else {
      tripsApi.addActivity(trip.id, values.dayId, values)
      setSelectedDayId(values.dayId)
    }
    closeDrawer()
  }

  const handleDelete = (activityId) => {
    if (!window.confirm('Delete this activity? This cannot be undone.')) return
    tripsApi.deleteActivity(trip.id, selectedDay.id, activityId)
  }

  if (!days.length) {
    return (
      <div className="rounded-3xl border border-dashed border-rw-divider bg-rw-surface p-8 text-center">
        <h3 className="font-display text-lg font-semibold text-rw-ink">
          Empty itinerary
        </h3>
        <p className="mt-2 text-sm text-rw-muted">
          Add a day to start scheduling activities for this trip.
        </p>
        <button
          type="button"
          onClick={() => tripsApi.addDay(trip.id)}
          className="mt-4 inline-flex items-center gap-1 rounded-full bg-rw-accent px-4 py-2 text-[13px] font-semibold text-white"
        >
          <IconPlus className="size-[10px]" />
          Add first day
        </button>
      </div>
    )
  }

  const dayIndex = days.findIndex((d) => d.id === selectedDay?.id)
  const dayCost = getDayActivityCost(selectedDay)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <DaySelector
        days={days}
        selectedDayId={selectedDay?.id}
        onSelect={setSelectedDayId}
        onAddDay={() => tripsApi.addDay(trip.id)}
        currency={trip.budget?.currency}
      />

      <section className="rounded-3xl bg-rw-surface p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 border-b border-rw-divider/50 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-[0.55px] text-rw-muted uppercase">
              Day {String(dayIndex + 1).padStart(2, '0')} · {selectedDay.date}
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-rw-ink">
              {selectedDay.title || `Day ${dayIndex + 1}`}
            </h2>
            <p className="mt-1 text-sm text-rw-muted">
              {activities.length}{' '}
              {activities.length === 1 ? 'activity' : 'activities'}
              {dayCost > 0
                ? ` · Est. ${formatMoney(dayCost, trip.budget?.currency)}`
                : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1 self-start rounded-full bg-rw-accent px-4 py-2 text-[13px] font-semibold text-white"
          >
            <IconPlus className="size-[10px]" />
            Add Activity
          </button>
        </div>

        {activities.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-rw-divider px-4 py-10 text-center">
            <p className="font-display text-base font-semibold text-rw-ink">
              No activities yet
            </p>
            <p className="mt-1 text-sm text-rw-muted">
              Add the first stop for this day to build the timeline.
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-4 rounded-full bg-rw-accent px-4 py-2 text-[13px] font-semibold text-white"
            >
              Add Activity
            </button>
          </div>
        ) : (
          <ol className="relative mt-5 space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-px before:bg-rw-divider/70">
            {activities.map((activity, index) => (
              <li key={activity.id} className="relative pl-8">
                <span
                  className={`absolute left-1.5 top-5 size-2.5 rounded-full ring-4 ring-rw-surface ${
                    activity.completed
                      ? 'bg-rw-teal'
                      : activity.id === nextId
                        ? 'bg-rw-accent'
                        : 'bg-rw-divider'
                  }`}
                />
                <ActivityCard
                  activity={activity}
                  currency={trip.budget?.currency}
                  isNext={activity.id === nextId}
                  dayOptions={dayOptions}
                  canMoveUp={index > 0}
                  canMoveDown={index < activities.length - 1}
                  onToggleComplete={() =>
                    tripsApi.toggleComplete(
                      trip.id,
                      selectedDay.id,
                      activity.id,
                    )
                  }
                  onEdit={() => openEdit(activity)}
                  onDelete={() => handleDelete(activity.id)}
                  onMoveUp={() =>
                    tripsApi.reorderActivity(
                      trip.id,
                      selectedDay.id,
                      activity.id,
                      index - 1,
                    )
                  }
                  onMoveDown={() =>
                    tripsApi.reorderActivity(
                      trip.id,
                      selectedDay.id,
                      activity.id,
                      index + 1,
                    )
                  }
                  onMoveToDay={(toDayId) => {
                    tripsApi.moveActivity(
                      trip.id,
                      selectedDay.id,
                      toDayId,
                      activity.id,
                    )
                    setSelectedDayId(toDayId)
                  }}
                />
              </li>
            ))}
          </ol>
        )}
      </section>

      <ActivityForm
        open={drawer.open}
        mode={drawer.mode}
        dayLabel={`Day ${(dayIndex >= 0 ? dayIndex : 0) + 1}`}
        days={days}
        initialValues={drawer.activity}
        onClose={closeDrawer}
        onSubmit={handleSave}
      />
    </div>
  )
}
