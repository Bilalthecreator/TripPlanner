import { tripService } from './tripService.js'
import { getTripExpenses } from '../utils/budgetUtils.js'

/**
 * Budget/expense facade. Uses trip store seed data via tripService;
 * keeps the Budget page off direct repository access.
 */
export const budgetService = {
  async loadBudget(tripId, { signal, delayMs } = {}) {
    const trip = await tripService.getTrip(tripId, { signal, delayMs })
    return {
      trip,
      expenses: getTripExpenses(trip),
    }
  },
}
