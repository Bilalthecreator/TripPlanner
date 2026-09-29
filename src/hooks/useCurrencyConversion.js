import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isAbortError } from '../services/http.js'
import {
  convertUsingBaseRates,
  getConversionTable,
} from '../services/currency/index.js'

/**
 * Fetch Frankfurter rates only when expense/budget currencies differ from display.
 */
export function useCurrencyConversion({
  displayCurrency,
  sourceCurrencies = [],
  enabled = true,
} = {}) {
  const display = String(displayCurrency || 'USD').toUpperCase()
  const sourcesKey = [
    ...new Set(
      (sourceCurrencies || [])
        .map((c) => String(c || '').toUpperCase())
        .filter(Boolean),
    ),
  ]
    .sort()
    .join('|')

  const needsNetwork = useMemo(() => {
    if (!enabled) return false
    return sourcesKey
      .split('|')
      .filter(Boolean)
      .some((c) => c !== display)
  }, [display, enabled, sourcesKey])

  const [status, setStatus] = useState(needsNetwork ? 'loading' : 'idle')
  const [table, setTable] = useState(null)
  const [error, setError] = useState(null)
  const [retryToken, setRetryToken] = useState(0)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const controller = new AbortController()
    const requestId = ++requestIdRef.current

    if (!enabled || !needsNetwork) {
      queueMicrotask(() => {
        if (requestId !== requestIdRef.current) return
        setTable({
          displayCurrency: display,
          ratesBase: display,
          rates: {},
          date: null,
          needed: false,
          missing: [],
        })
        setError(null)
        setStatus('idle')
      })
      return () => controller.abort()
    }

    queueMicrotask(() => {
      if (requestId !== requestIdRef.current) return
      setStatus('loading')
      setError(null)
    })

    getConversionTable(display, sourcesKey.split('|').filter(Boolean), {
      signal: controller.signal,
    })
      .then((result) => {
        if (requestId !== requestIdRef.current) return
        setTable(result)
        setStatus('success')
      })
      .catch((err) => {
        if (isAbortError(err) || requestId !== requestIdRef.current) return
        setError(err)
        setTable(null)
        setStatus('error')
      })

    return () => controller.abort()
  }, [display, enabled, needsNetwork, sourcesKey, retryToken])

  const convert = useCallback(
    (amount, fromCurrency) => {
      const from = String(fromCurrency || display).toUpperCase()
      if (from === display) return Number(amount) || 0
      if (!table || status === 'error' || status === 'loading') return null
      return convertUsingBaseRates(amount, from, display, {
        ratesBase: table.ratesBase,
        rates: table.rates,
      })
    },
    [display, status, table],
  )

  const retry = useCallback(() => setRetryToken((n) => n + 1), [])

  return {
    status: needsNetwork ? status : 'idle',
    needed: needsNetwork,
    table,
    error,
    convert,
    missing: table?.missing || [],
    retry,
  }
}
