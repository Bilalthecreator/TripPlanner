import { useContext } from 'react'
import { SavedPlacesContext } from './savedPlacesContext.js'

export function useSavedPlaces() {
  const ctx = useContext(SavedPlacesContext)
  if (!ctx) {
    throw new Error('useSavedPlaces must be used within SavedPlacesProvider')
  }
  return ctx
}
