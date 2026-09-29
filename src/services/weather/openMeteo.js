import { cached, cacheKey } from '../cache.js'
import { fetchJson } from '../http.js'
import {
  aqiLabelFromIndex,
  degreesToCompass,
  formatLocalTime,
  packingTipFromWeather,
  rainLabelFromProbability,
  uvLabelFromIndex,
  weatherCodeToCondition,
  weatherCodeToForecastIcon,
} from './codes.js'

const WEATHER_TTL = 10 * 60 * 1000
const FORECAST_BASE = 'https://api.open-meteo.com/v1/forecast'
const AIR_QUALITY_BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality'

async function fetchAirQuality(latitude, longitude, { signal } = {}) {
  try {
    const url = new URL(AIR_QUALITY_BASE)
    url.searchParams.set('latitude', String(latitude))
    url.searchParams.set('longitude', String(longitude))
    url.searchParams.set('current', 'european_aqi,us_aqi')
    url.searchParams.set('timezone', 'auto')
    const payload = await fetchJson(url.toString(), { signal })
    const current = payload?.current || {}
    return current.european_aqi ?? current.us_aqi ?? null
  } catch {
    return null
  }
}

/**
 * Current weather + forecast preview fields for Discover WeatherPreview.
 */
export async function getCurrentWeather(
  latitude,
  longitude,
  { signal, city, region } = {},
) {
  const lat = Number(latitude)
  const lon = Number(longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error('Weather requires valid coordinates.')
  }

  const key = cacheKey('weather:current', [lat.toFixed(2), lon.toFixed(2)])
  return cached(key, WEATHER_TTL, async () => {
    const url = new URL(FORECAST_BASE)
    url.searchParams.set('latitude', String(lat))
    url.searchParams.set('longitude', String(lon))
    url.searchParams.set(
      'current',
      [
        'temperature_2m',
        'weather_code',
        'wind_speed_10m',
        'wind_direction_10m',
        'precipitation',
      ].join(','),
    )
    url.searchParams.set(
      'hourly',
      'uv_index,precipitation_probability,temperature_2m,weather_code',
    )
    url.searchParams.set(
      'daily',
      [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_probability_max',
        'uv_index_max',
      ].join(','),
    )
    url.searchParams.set('forecast_days', '7')
    url.searchParams.set('timezone', 'auto')
    url.searchParams.set('wind_speed_unit', 'kmh')

    const [payload, aqi] = await Promise.all([
      fetchJson(url.toString(), { signal }),
      fetchAirQuality(lat, lon, { signal }),
    ])

    const current = payload?.current || {}
    const hourly = payload?.hourly || {}
    const daily = payload?.daily || {}
    const timeZone = payload?.timezone

    // Prefer current-hour UV / rain from hourly series when available.
    let uvIndex = daily.uv_index_max?.[0]
    let rainProb = current.precipitation_probability
    if (Array.isArray(hourly.time) && current.time) {
      const idx = hourly.time.indexOf(current.time)
      if (idx >= 0) {
        if (hourly.uv_index?.[idx] != null) uvIndex = hourly.uv_index[idx]
        if (hourly.precipitation_probability?.[idx] != null) {
          rainProb = hourly.precipitation_probability[idx]
        }
      }
    }
    if (rainProb == null && daily.precipitation_probability_max?.[0] != null) {
      rainProb = daily.precipitation_probability_max[0]
    }

    const windSpeed = current.wind_speed_10m
    const windDir = degreesToCompass(current.wind_direction_10m)
    const rainRounded =
      rainProb == null || !Number.isFinite(Number(rainProb))
        ? null
        : `${Math.round(Number(rainProb))}%`

    const condition = weatherCodeToCondition(current.weather_code)

    return {
      city: city || `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
      region: region || timeZone || '',
      localTime: formatLocalTime(current.time, timeZone),
      temperatureC: current.temperature_2m,
      condition,
      weatherCode: current.weather_code,
      uvIndex:
        uvIndex == null || !Number.isFinite(Number(uvIndex))
          ? '—'
          : Math.round(Number(uvIndex) * 10) / 10,
      uvLabel: uvLabelFromIndex(uvIndex),
      wind:
        windSpeed == null || !Number.isFinite(Number(windSpeed))
          ? '—'
          : String(Math.round(Number(windSpeed))),
      windLabel: windDir ? `km/h ${windDir}` : 'km/h',
      rainProb: rainRounded ?? '—',
      rainLabel: rainLabelFromProbability(rainProb),
      aqi: aqi == null ? null : Math.round(Number(aqi)),
      aqiLabel: aqiLabelFromIndex(aqi),
      latitude: lat,
      longitude: lon,
      timezone: timeZone,
      forecastDays: Array.isArray(daily.time) ? daily.time.length : 0,
      packingTip: packingTipFromWeather(
        current.weather_code,
        current.temperature_2m,
      ),
      // Destination Details WeatherSummary shape
      title: city
        ? `${city.split(',')[0].trim()} Forecast & Seasonality`
        : 'Local Forecast & Seasonality',
      summary: `Current conditions: ${condition.toLowerCase()}`,
      _daily: daily,
    }
  })
}

/**
 * Daily forecast rows for Destination Details WeatherSummary.
 */
export async function getDailyForecast(
  latitude,
  longitude,
  { signal, days = 5, city } = {},
) {
  const current = await getCurrentWeather(latitude, longitude, {
    signal,
    city,
  })
  const daily = current._daily || {}
  const times = Array.isArray(daily.time) ? daily.time : []

  return times.slice(0, days).map((date, index) => {
    const code = daily.weather_code?.[index]
    const label = formatForecastLabel(date, index === 0)
    return {
      id: `d${index + 1}-${date}`,
      label,
      highC: Math.round(Number(daily.temperature_2m_max?.[index] ?? 0)),
      lowC: Math.round(Number(daily.temperature_2m_min?.[index] ?? 0)),
      precip: Math.round(
        Number(daily.precipitation_probability_max?.[index] ?? 0),
      ),
      condition: weatherCodeToForecastIcon(code),
      weatherCode: code,
      isToday: index === 0,
    }
  })
}

function formatForecastLabel(isoDate, isToday) {
  try {
    const date = new Date(`${isoDate}T12:00:00`)
    if (isToday) {
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(date)
    }
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date)
  } catch {
    return isoDate
  }
}

export const weather = {
  getCurrentWeather,
  getDailyForecast,
}
