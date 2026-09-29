import { tripService } from './tripService.js'
import { getTripExpenses } from '../utils/budgetUtils.js'

/**
 * Budget/expense facade. Trip + expenses are local application data.
 * No artificial delay — FX loading is handled separately on the page.
 */
export const budgetService = {
  async loadBudget(tripId, { signal, delayMs = 0 } = {}) {
    const trip = await tripService.getTrip(tripId, { signal, delayMs })
    return {
      trip,
      expenses: getTripExpenses(trip),
    }
  },
}
