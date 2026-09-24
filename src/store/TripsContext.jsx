import { useReducer } from 'react'
import { TripsContext } from './tripsContext.js'
import {
  clearTripsForPreview,
  loadTrips,
  restoreSeedTrips,
  saveTrips,
} from '../services/tripsRepository.js'
import {
  createEmptyTrip,
  createId,
  mapDay,
  mapTrip,
  normalizeActivity,
  sortActivities,
  updateTripWithBasics,
} from '../utils/tripHelpers.js'

function persist(trips) {
  saveTrips(trips)
  return trips
}

function reducer(state, action) {
  switch (action.type) {
    case 'replace':
      return persist(action.trips)

    case 'create': {
      const trip = action.trip || createEmptyTrip(action.basics)
      return persist([...state, trip])
    }

    case 'updateBasics': {
      return persist(
        mapTrip(state, action.tripId, (trip) =>
          updateTripWithBasics(trip, action.basics),
        ),
      )
    }

    case 'addDay': {
      return persist(
        mapTrip(state, action.tripId, (trip) => {
          const nextIndex = (trip.days || []).length + 1
          const last = trip.days?.[trip.days.length - 1]
          let nextDate = action.date
          if (!nextDate && last?.date) {
            const d = new Date(`${last.date}T12:00:00`)
            d.setDate(d.getDate() + 1)
            nextDate = d.toISOString().slice(0, 10)
          }
          const day = {
            id: createId('day'),
            date: nextDate || new Date().toISOString().slice(0, 10),
            title: action.title || `Day ${nextIndex}`,
            activities: [],
          }
          return {
            ...trip,
            endDate: day.date > (trip.endDate || '') ? day.date : trip.endDate,
            days: [...(trip.days || []), day],
            updatedAt: new Date().toISOString(),
          }
        }),
      )
    }

    case 'updateDay': {
      return persist(
        mapTrip(state, action.tripId, (trip) =>
          mapDay(trip, action.dayId, (day) => ({
            ...day,
            ...action.patch,
          })),
        ),
      )
    }

    case 'addActivity': {
      return persist(
        mapTrip(state, action.tripId, (trip) =>
          mapDay(trip, action.dayId, (day) => ({
            ...day,
            activities: sortActivities([
              ...(day.activities || []),
              normalizeActivity(action.activity),
            ]),
          })),
        ),
      )
    }

    case 'updateActivity': {
      return persist(
        mapTrip(state, action.tripId, (trip) =>
          mapDay(trip, action.dayId, (day) => ({
            ...day,
            activities: sortActivities(
              (day.activities || []).map((act) =>
                act.id === action.activityId
                  ? normalizeActivity({ ...act, ...action.patch, id: act.id })
                  : act,
              ),
            ),
          })),
        ),
      )
    }

    case 'deleteActivity': {
      return persist(
        mapTrip(state, action.tripId, (trip) =>
          mapDay(trip, action.dayId, (day) => ({
            ...day,
            activities: (day.activities || []).filter(
              (act) => act.id !== action.activityId,
            ),
          })),
        ),
      )
    }

    case 'toggleComplete': {
      return persist(
        mapTrip(state, action.tripId, (trip) =>
          mapDay(trip, action.dayId, (day) => ({
            ...day,
            activities: (day.activities || []).map((act) =>
              act.id === action.activityId
                ? { ...act, completed: !act.completed }
                : act,
            ),
          })),
        ),
      )
    }

    case 'reorderActivities': {
      return persist(
        mapTrip(state, action.tripId, (trip) =>
          mapDay(trip, action.dayId, (day) => {
            const list = [...(day.activities || [])]
            const from = list.findIndex((a) => a.id === action.activityId)
            if (from < 0) return day
            const [item] = list.splice(from, 1)
            const to = Math.max(0, Math.min(action.toIndex, list.length))
            list.splice(to, 0, item)
            return { ...day, activities: list }
          }),
        ),
      )
    }

    case 'moveActivity': {
      return persist(
        mapTrip(state, action.tripId, (trip) => {
          let moving = null
          const stripped = (trip.days || []).map((day) => {
            if (day.id !== action.fromDayId) return day
            const nextActs = []
            for (const act of day.activities || []) {
              if (act.id === action.activityId) moving = act
              else nextActs.push(act)
            }
            return { ...day, activities: nextActs }
          })

          if (!moving) return trip

          return {
            ...trip,
            days: stripped.map((day) => {
              if (day.id !== action.toDayId) return day
              const activities = [...(day.activities || [])]
              const insertAt =
                action.toIndex == null
                  ? activities.length
                  : Math.max(0, Math.min(action.toIndex, activities.length))
              activities.splice(insertAt, 0, moving)
              return { ...day, activities }
            }),
            updatedAt: new Date().toISOString(),
          }
        }),
      )
    }

    default:
      return state
  }
}

export function TripsProvider({ children }) {
  const [trips, dispatch] = useReducer(reducer, null, () => loadTrips())

  const api = {
    trips,
    getTrip: (id) => trips.find((t) => t.id === id) ?? null,
    createTrip: (basics) => {
      const trip = createEmptyTrip(basics)
      dispatch({ type: 'create', trip })
      return trip
    },
    updateBasics: (tripId, basics) =>
      dispatch({ type: 'updateBasics', tripId, basics }),
    addDay: (tripId, payload = {}) =>
      dispatch({ type: 'addDay', tripId, ...payload }),
    updateDay: (tripId, dayId, patch) =>
      dispatch({ type: 'updateDay', tripId, dayId, patch }),
    addActivity: (tripId, dayId, activity) =>
      dispatch({ type: 'addActivity', tripId, dayId, activity }),
    updateActivity: (tripId, dayId, activityId, patch) =>
      dispatch({ type: 'updateActivity', tripId, dayId, activityId, patch }),
    deleteActivity: (tripId, dayId, activityId) =>
      dispatch({ type: 'deleteActivity', tripId, dayId, activityId }),
    toggleComplete: (tripId, dayId, activityId) =>
      dispatch({ type: 'toggleComplete', tripId, dayId, activityId }),
    reorderActivity: (tripId, dayId, activityId, toIndex) =>
      dispatch({
        type: 'reorderActivities',
        tripId,
        dayId,
        activityId,
        toIndex,
      }),
    moveActivity: (tripId, fromDayId, toDayId, activityId, toIndex) =>
      dispatch({
        type: 'moveActivity',
        tripId,
        fromDayId,
        toDayId,
        activityId,
        toIndex,
      }),
    previewEmpty: () => {
      clearTripsForPreview()
      dispatch({ type: 'replace', trips: [] })
    },
    restoreSeed: () => {
      dispatch({ type: 'replace', trips: restoreSeedTrips() })
    },
    reload: () => dispatch({ type: 'replace', trips: loadTrips() }),
  }

  return <TripsContext.Provider value={api}>{children}</TripsContext.Provider>
}
