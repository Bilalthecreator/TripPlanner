import { useEffect, useReducer } from 'react'
import { SavedPlacesContext } from './savedPlacesContext.js'

const STORAGE_KEY = 'roamwise.savedPlaces'

function readInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'toggle': {
      const exists = state.includes(action.id)
      return exists ? state.filter((id) => id !== action.id) : [...state, action.id]
    }
    case 'add':
      return state.includes(action.id) ? state : [...state, action.id]
    case 'remove':
      return state.filter((id) => id !== action.id)
    default:
      return state
  }
}

export function SavedPlacesProvider({ children }) {
  const [savedIds, dispatch] = useReducer(reducer, [], readInitial)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedIds))
  }, [savedIds])

  const value = {
    savedIds,
    isSaved: (id) => savedIds.includes(id),
    toggleSaved: (id) => dispatch({ type: 'toggle', id }),
    addSaved: (id) => dispatch({ type: 'add', id }),
    removeSaved: (id) => dispatch({ type: 'remove', id }),
  }

  return (
    <SavedPlacesContext.Provider value={value}>
      {children}
    </SavedPlacesContext.Provider>
  )
}
