import { useEffect, useRef, useState } from 'react'
import { useDebouncedValue } from './useDebouncedValue.js'
import { isAbortError } from '../services/http.js'
import { searchGeocode } from '../services/geoapify/index.js'

/**
 * Debounced Geoapify destination search with abort + stale protection.
 */
export function useDestinationLookup(query, { enabled = true, limit = 6 } = {}) {
  const debounced = useDebouncedValue(query, 320)
  const [status, setStatus] = useState('idle')
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const q = String(debounced || '').trim()
    const controller = new AbortController()
    const requestId = ++requestIdRef.current

    if (!enabled || !q) {
      queueMicrotask(() => {
        if (requestId !== requestIdRef.current) return
        setResults([])
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

    searchGeocode(q, { limit, signal: controller.signal })
      .then((items) => {
        if (requestId !== requestIdRef.current) return
        setResults(items)
        setStatus(items.length ? 'success' : 'empty')
      })
      .catch((err) => {
        if (isAbortError(err) || requestId !== requestIdRef.current) return
        setError(err)
        setStatus('error')
        setResults([])
      })

    return () => controller.abort()
  }, [debounced, enabled, limit])

  return { status, results, error, query: debounced.trim() }
}
