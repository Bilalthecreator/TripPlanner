import { ApiError, fetchJson } from '../http.js'

const GEOAPIFY_BASE = 'https://api.geoapify.com'

export function getGeoapifyApiKey() {
  const key = import.meta.env.VITE_GEOAPIFY_API_KEY?.trim() || ''
  if (!key || key === 'your_key') return ''
  return key
}

export function requireGeoapifyApiKey() {
  const key = getGeoapifyApiKey()
  if (!key) {
    throw new ApiError(
      'Missing VITE_GEOAPIFY_API_KEY. Add it to your .env file.',
      { code: 'MISSING_API_KEY' },
    )
  }
  return key
}

export async function geoapifyGet(path, params = {}, { signal } = {}) {
  const apiKey = requireGeoapifyApiKey()
  const url = new URL(path, GEOAPIFY_BASE)
  Object.entries({ ...params, apiKey }).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    url.searchParams.set(key, String(value))
  })
  return fetchJson(url.toString(), { signal })
}
