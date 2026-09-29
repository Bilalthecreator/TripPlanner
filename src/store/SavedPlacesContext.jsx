import { useEffect, useReducer } from 'react'
import { SavedPlacesContext } from './savedPlacesContext.js'
import {
  hydrateSavedPlaces,
  normalizeSavedPlace,
  resolveSavedPlaceById,
} from '../utils/savedPlaces.js'

const STORAGE_KEY = 'roamwise.savedPlaces'

function readInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return hydrateSavedPlaces(JSON.parse(raw))
  } catch {
    return []
  }
}

function toPlace(input) {
  if (typeof input === 'string') {
    return resolveSavedPlaceById(input)
  }
  return normalizeSavedPlace(input) || resolveSavedPlaceById(input?.id)
}

function mergePlace(existing, patch) {
  if (!existing) return null
  return normalizeSavedPlace({
    ...existing,
    ...patch,
    id: existing.id,
    savedAt: existing.savedAt,
    meta: {
      ...existing.meta,
      ...(patch.meta || {}),
    },
  })
}

function reducer(state, action) {
  switch (action.type) {
    case 'toggle': {
      const place = toPlace(action.place)
      if (!place) return state
      const exists = state.some((item) => item.id === place.id)
      return exists
        ? state.filter((item) => item.id !== place.id)
        : [...state, place]
    }
    case 'add': {
      const place = toPlace(action.place)
      if (!place) return state
      if (state.some((item) => item.id === place.id)) return state
      return [...state, place]
    }
    case 'remove':
      return state.filter((item) => item.id !== action.id)
    case 'patch': {
      const idx = state.findIndex((item) => item.id === action.id)
      if (idx < 0) return state
      const merged = mergePlace(state[idx], action.patch || {})
      if (!merged) return state
      const next = state.slice()
      next[idx] = merged
      return next
    }
    case 'patchMany': {
      const updates = Array.isArray(action.updates) ? action.updates : []
      if (!updates.length) return state
      let changed = false
      const next = state.map((item) => {
        const hit = updates.find((u) => u.id === item.id)
        if (!hit) return item
        const merged = mergePlace(item, hit.patch || {})
        if (!merged) return item
        changed = true
        return merged
      })
      return changed ? next : state
    }
    case 'replace':
      return Array.isArray(action.places) ? action.places : state
    default:
      return state
  }
}

export function SavedPlacesProvider({ children }) {
  const [savedPlaces, dispatch] = useReducer(reducer, [], readInitial)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPlaces))
    } catch {
      /* ignore quota / private mode */
    }
  }, [savedPlaces])

  const value = {
    savedPlaces,
    savedIds: savedPlaces.map((p) => p.id),
    isSaved: (id) => savedPlaces.some((item) => item.id === id),
    toggleSaved: (placeOrId) => dispatch({ type: 'toggle', place: placeOrId }),
    addSaved: (placeOrId) => dispatch({ type: 'add', place: placeOrId }),
    removeSaved: (id) => dispatch({ type: 'remove', id }),
    patchSaved: (id, patch) => dispatch({ type: 'patch', id, patch }),
    patchSavedMany: (updates) =>
      dispatch({ type: 'patchMany', updates }),
    replaceSaved: (places) =>
      dispatch({ type: 'replace', places: hydrateSavedPlaces(places) }),
  }

  return (
    <SavedPlacesContext.Provider value={value}>
      {children}
    </SavedPlacesContext.Provider>
  )
}
