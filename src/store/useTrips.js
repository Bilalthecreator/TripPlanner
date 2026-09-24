import { useContext } from 'react'
import { TripsContext } from './tripsContext.js'

export function useTrips() {
  const ctx = useContext(TripsContext)
  if (!ctx) {
    throw new Error('useTrips must be used within TripsProvider')
  }
  return ctx
}
