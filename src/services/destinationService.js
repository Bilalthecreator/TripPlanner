import {
  getAttractionsRecord,
  getDetailsRecord,
  getForecastRecord,
  getHotelsRecord,
  getLocationRecord,
  getRestaurantsRecord,
  getWeatherRecord,
} from '../data/destinationDetails.js'
import { delay, maybeFail, MockRequestError } from './http.js'
import { MOCK_DELAY_MS } from './mockConfig.js'

async function run(signal, delayMs, factory) {
  await delay(delayMs ?? MOCK_DELAY_MS, signal)
  maybeFail()
  return factory()
}

/**
 * Destination Details service — each method is independently replaceable with a real API.
 */
export const destinationService = {
  async getDestinationById(destinationId, { signal, delayMs } = {}) {
    return run(signal, delayMs, () => {
      const destination = getDetailsRecord(destinationId)
      if (!destination) {
        const error = new MockRequestError('Destination not found.')
        error.code = 'NOT_FOUND'
        throw error
      }
      return destination
    })
  },

  async getDestinationImages(destinationId, { signal, delayMs } = {}) {
    return run(signal, delayMs ?? MOCK_DELAY_MS + 120, () => {
      const destination = getDetailsRecord(destinationId)
      if (!destination) throw new MockRequestError('Images unavailable.')
      return {
        photoCount: destination.photoCount,
        gallery: destination.gallery,
      }
    })
  },

  async getDestinationWeather(destinationId, { signal, delayMs } = {}) {
    return run(signal, delayMs ?? MOCK_DELAY_MS + 80, () => {
      const weather = getWeatherRecord(destinationId)
      if (!weather) throw new MockRequestError('Weather unavailable.')
      return weather
    })
  },

  async getDestinationForecast(destinationId, { signal, delayMs } = {}) {
    return run(signal, delayMs ?? MOCK_DELAY_MS + 160, () => {
      const forecast = getForecastRecord(destinationId)
      if (!forecast) throw new MockRequestError('Forecast unavailable.')
      return forecast
    })
  },

  async getDestinationAttractions(destinationId, { signal, delayMs, filter } = {}) {
    return run(signal, delayMs ?? MOCK_DELAY_MS + 200, () => {
      let attractions = getAttractionsRecord(destinationId)
      if (!attractions) throw new MockRequestError('Attractions unavailable.')
      if (filter && filter !== 'all') {
        attractions = attractions.filter((item) => item.filters?.includes(filter))
      }
      return attractions
    })
  },

  async getDestinationRestaurants(destinationId, { signal, delayMs } = {}) {
    return run(signal, delayMs ?? MOCK_DELAY_MS + 240, () => {
      const restaurants = getRestaurantsRecord(destinationId)
      if (!restaurants) throw new MockRequestError('Restaurants unavailable.')
      return restaurants
    })
  },

  async getDestinationHotels(destinationId, { signal, delayMs } = {}) {
    return run(signal, delayMs ?? MOCK_DELAY_MS + 280, () => {
      const hotels = getHotelsRecord(destinationId)
      if (!hotels) throw new MockRequestError('Hotels unavailable.')
      return hotels
    })
  },

  async getDestinationLocation(destinationId, { signal, delayMs } = {}) {
    return run(signal, delayMs ?? MOCK_DELAY_MS + 180, () => {
      const location = getLocationRecord(destinationId)
      if (!location) throw new MockRequestError('Location unavailable.')
      return location
    })
  },
}
