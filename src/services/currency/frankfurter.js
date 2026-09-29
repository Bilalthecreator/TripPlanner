import { cached, cacheKey } from '../cache.js'
import { ApiError, fetchJson } from '../http.js'

const FRANKFURTER_BASE = 'https://api.frankfurter.app'
const RATES_TTL = 60 * 60 * 1000

/**
 * Latest ECB rates via Frankfurter (no API key).
 * Rates are quoted as: 1 base = rates[quote] quote units.
 * Fetches the full table for a base so unsupported `to` codes (e.g. PKR)
 * do not 404 the whole request.
 */
export async function getLatestRates(baseCurrency, { signal } = {}) {
  const base = String(baseCurrency || 'USD').toUpperCase()
  const key = cacheKey('frankfurter:latest', [base])

  return cached(key, RATES_TTL, async () => {
    const url = new URL(`${FRANKFURTER_BASE}/latest`)
    url.searchParams.set('from', base)

    const payload = await fetchJson(url.toString(), { signal })
    return {
      base: payload.base || base,
      date: payload.date || null,
      rates: payload.rates || {},
    }
  })
}

/**
 * Convert amount from `fromCurrency` into `toCurrency`.
 * Uses a rates table where `ratesBase` is the display/base currency and
 * rates[currency] means: 1 ratesBase = rates[currency] of that currency.
 * Therefore: amountInFrom / rates[from] = amountInBase.
 *
 * Returns null when conversion is unavailable (missing/unsupported rate).
 */
export function convertUsingBaseRates(
  amount,
  fromCurrency,
  toCurrency,
  { ratesBase, rates } = {},
) {
  const value = Number(amount)
  if (!Number.isFinite(value)) return null

  const from = String(fromCurrency || '').toUpperCase()
  const to = String(toCurrency || '').toUpperCase()
  if (!from || !to) return null
  if (from === to) return value

  const base = String(ratesBase || '').toUpperCase()
  const table = rates || {}

  if (base !== to) {
    return null
  }

  const rate = table[from]
  if (!Number.isFinite(Number(rate)) || Number(rate) === 0) return null
  return value / Number(rate)
}

/**
 * Ensure we have rates for converting a set of source currencies into displayCurrency.
 * Skips the network when every source already matches the display currency.
 */
export async function getConversionTable(
  displayCurrency,
  sourceCurrencies = [],
  { signal } = {},
) {
  const display = String(displayCurrency || 'USD').toUpperCase()
  const sources = [
    ...new Set(
      (sourceCurrencies || [])
        .map((c) => String(c || '').toUpperCase())
        .filter(Boolean),
    ),
  ]
  const needed = sources.filter((c) => c !== display)

  if (!needed.length) {
    return {
      displayCurrency: display,
      ratesBase: display,
      rates: {},
      date: null,
      needed: false,
      missing: [],
    }
  }

  try {
    const latest = await getLatestRates(display, { signal })
    const missing = needed.filter((c) => latest.rates[c] == null)
    return {
      displayCurrency: display,
      ratesBase: latest.base || display,
      rates: latest.rates || {},
      date: latest.date,
      needed: true,
      missing,
    }
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new ApiError(
      error?.message || 'Currency rates unavailable.',
      { code: 'RATES_UNAVAILABLE' },
    )
  }
}

export const frankfurterService = {
  getLatestRates,
  getConversionTable,
  convertUsingBaseRates,
}
