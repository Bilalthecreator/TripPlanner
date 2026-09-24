import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDebouncedValue } from './useDebouncedValue.js'
import { discoverService } from '../services/discoverService.js'
import { isAbortError } from '../services/http.js'

/**
 * Search state machine with debounce, URL sync, suggestions, and stale-result protection.
 */
export function useDestinationSearch({ filter = 'all' } = {}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlQuery = searchParams.get('q') ?? ''

  const [inputValue, setInputValue] = useState(urlQuery)
  const debouncedQuery = useDebouncedValue(inputValue, 320)
  const lastPushedRef = useRef(urlQuery)

  const [status, setStatus] = useState(urlQuery ? 'loading' : 'idle')
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [retryToken, setRetryToken] = useState(0)

  const searchRequestRef = useRef(0)
  const suggestRequestRef = useRef(0)

  // Sync debounced query → URL
  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    const trimmed = debouncedQuery.trim()
    if (trimmed) next.set('q', trimmed)
    else next.delete('q')

    if (next.toString() !== searchParams.toString()) {
      lastPushedRef.current = trimmed
      setSearchParams(next, { replace: true })
    }
  }, [debouncedQuery, searchParams, setSearchParams])

  // Browser back/forward: adopt URL when it changed outside our writes
  useEffect(() => {
    if (urlQuery === lastPushedRef.current) return undefined
    lastPushedRef.current = urlQuery
    queueMicrotask(() => setInputValue(urlQuery))
    return undefined
  }, [urlQuery])

  // Suggestions
  useEffect(() => {
    const q = debouncedQuery.trim()
    const controller = new AbortController()
    const requestId = ++suggestRequestRef.current

    if (!q) {
      queueMicrotask(() => {
        if (requestId === suggestRequestRef.current) setSuggestions([])
      })
      return () => controller.abort()
    }

    discoverService
      .getSuggestions(q, { signal: controller.signal })
      .then((items) => {
        if (requestId !== suggestRequestRef.current) return
        setSuggestions(items)
      })
      .catch((err) => {
        if (isAbortError(err) || requestId !== suggestRequestRef.current) return
        setSuggestions([])
      })

    return () => controller.abort()
  }, [debouncedQuery])

  // Destination search with abort + stale protection
  useEffect(() => {
    const q = debouncedQuery.trim()
    const controller = new AbortController()
    const requestId = ++searchRequestRef.current

    queueMicrotask(() => {
      if (requestId !== searchRequestRef.current) return
      setStatus('loading')
      setError(null)
    })

    discoverService
      .searchDestinations(
        { query: q, filter, trendingOnly: !q },
        { signal: controller.signal },
      )
      .then((payload) => {
        if (requestId !== searchRequestRef.current) return
        setResults(payload.results)
        setStatus(payload.results.length === 0 ? 'empty' : 'success')
      })
      .catch((err) => {
        if (isAbortError(err) || requestId !== searchRequestRef.current) return
        setError(err)
        setStatus('error')
      })

    return () => controller.abort()
  }, [debouncedQuery, filter, retryToken])

  const retry = () => setRetryToken((n) => n + 1)

  const selectSuggestion = (item) => {
    setInputValue(item.name)
    setShowSuggestions(false)
  }

  const clearSearch = () => {
    setInputValue('')
    setShowSuggestions(false)
  }

  return {
    inputValue,
    setInputValue,
    query: debouncedQuery.trim(),
    status,
    results,
    error,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    selectSuggestion,
    clearSearch,
    retry,
  }
}
