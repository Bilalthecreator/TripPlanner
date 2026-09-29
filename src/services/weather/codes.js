/** WMO Weather interpretation codes → UI condition labels. */
const WMO_CONDITIONS = {
  0: 'Clear',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Rime Fog',
  51: 'Light Drizzle',
  53: 'Drizzle',
  55: 'Heavy Drizzle',
  56: 'Freezing Drizzle',
  57: 'Freezing Drizzle',
  61: 'Light Rain',
  63: 'Rain',
  65: 'Heavy Rain',
  66: 'Freezing Rain',
  67: 'Freezing Rain',
  71: 'Light Snow',
  73: 'Snow',
  75: 'Heavy Snow',
  77: 'Snow Grains',
  80: 'Rain Showers',
  81: 'Rain Showers',
  82: 'Heavy Showers',
  85: 'Snow Showers',
  86: 'Snow Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm',
  99: 'Thunderstorm',
}

export function weatherCodeToCondition(code) {
  const n = Number(code)
  if (!Number.isFinite(n)) return 'Unknown'
  return WMO_CONDITIONS[n] ?? `Code ${n}`
}

export function uvLabelFromIndex(uv) {
  const n = Number(uv)
  if (!Number.isFinite(n)) return '—'
  if (n < 3) return 'Low'
  if (n < 6) return 'Moderate'
  if (n < 8) return 'High'
  if (n < 11) return 'Very High'
  return 'Extreme'
}

export function rainLabelFromProbability(pct) {
  const n = Number(pct)
  if (!Number.isFinite(n)) return '—'
  if (n < 15) return 'Optimal'
  if (n < 35) return 'Fair'
  if (n < 60) return 'Showers'
  return 'Likely'
}

export function aqiLabelFromIndex(aqi) {
  const n = Number(aqi)
  if (!Number.isFinite(n)) return 'Air quality unavailable'
  if (n <= 40) return `Clean Air Quality Index: ${Math.round(n)}`
  return `Air Quality Index: ${Math.round(n)}`
}

const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']

export function degreesToCompass(degrees) {
  const d = Number(degrees)
  if (!Number.isFinite(d)) return ''
  const idx = Math.round(((d % 360) / 22.5)) % 16
  return COMPASS[idx]
}

export function formatLocalTime(iso, timeZone) {
  try {
    const date = new Date(iso)
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timeZone || undefined,
      timeZoneName: 'short',
    }).format(date)
  } catch {
    return iso || ''
  }
}

export function weatherCodeToForecastIcon(code) {
  const n = Number(code)
  if (!Number.isFinite(n)) return 'cloudy'
  if (n === 0 || n === 1) return 'sunny'
  if (n === 2) return 'partly-sunny'
  if (n === 3 || n === 45 || n === 48) return 'cloudy'
  if (n >= 51) return 'rain'
  return 'cloudy'
}

export function packingTipFromWeather(code, temperatureC) {
  const n = Number(code)
  const temp = Number(temperatureC)
  if (Number.isFinite(n) && n >= 51) {
    return 'PACK A LIGHT RAIN LAYER AND WATERPROOF SHOES'
  }
  if (Number.isFinite(temp) && temp >= 30) {
    return 'PACK LIGHT CLOTHING, SUN PROTECTION, AND WATER'
  }
  if (Number.isFinite(temp) && temp <= 5) {
    return 'PACK WARM LAYERS AND COMFORTABLE WALKING SHOES'
  }
  return 'PACK LIGHT LAYERS AND COMFORTABLE WALKING SHOES'
}
