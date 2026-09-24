import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDebouncedValue } from './useDebouncedValue.js'
import { useAsyncResource } from './useAsyncResource.js'
import { tripService } from '../services/tripService.js'

const VALID_FILTERS = new Set(['all', 'upcoming', 'ongoing', 'completed'])

/**
 * Trips list search + filter with URL sync (?q=, ?filter=).
 */
export function useTripsList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filterParam = searchParams.get('filter') || 'all'
  const activeFilter = VALID_FILTERS.has(filterParam) ? filterParam : 'all'
  const urlQuery = searchParams.get('q') || ''

  const [inputValue, setInputValue] = useState(urlQuery)
  const debouncedQuery = useDebouncedValue(inputValue, 320)
  const lastPushedRef = useRef(urlQuery)

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

  const query = debouncedQuery.trim()

  const resource = useAsyncResource(
    (signal) =>
      tripService.listTrips({ query, filter: activeFilter }, { signal }),
    [query, activeFilter],
  )

  const setFilter = useCallback(
    (filterId) => {
      const next = new URLSearchParams(searchParams)
      if (!filterId || filterId === 'all') next.delete('filter')
      else next.set('filter', filterId)
      setSearchParams(next, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const clearSearch = useCallback(() => {
    setInputValue('')
    lastPushedRef.current = ''
  }, [])

  return {
    inputValue,
    setInputValue,
    query,
    activeFilter,
    setFilter,
    clearSearch,
    status: resource.status,
    data: resource.data,
    error: resource.error,
    retry: resource.retry,
    trips: resource.data?.results ?? [],
    allCount: resource.data?.allCount ?? 0,
  }
}
