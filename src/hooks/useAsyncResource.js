import { useCallback, useEffect, useRef, useState } from 'react'
import { isAbortError } from '../services/http.js'

/**
 * Explicit async section state: idle | loading | success | error | empty
 */
export function useAsyncResource(fetcher, deps = [], { enabled = true } = {}) {
  const [status, setStatus] = useState(enabled ? 'loading' : 'idle')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    const controller = new AbortController()
    const requestId = ++requestIdRef.current

    let cancelled = false

    // Defer loading transition so the effect stays sync-clean for React Compiler lint.
    const start = queueMicrotask(() => {
      if (cancelled || requestId !== requestIdRef.current) return
      setStatus('loading')
      setError(null)
    })

    fetcher(controller.signal)
      .then((result) => {
        if (cancelled || requestId !== requestIdRef.current) return
        const empty =
          result == null ||
          (Array.isArray(result) && result.length === 0) ||
          (typeof result === 'object' &&
            Array.isArray(result.results) &&
            result.results.length === 0)

        setData(result)
        setStatus(empty ? 'empty' : 'success')
      })
      .catch((err) => {
        if (
          cancelled ||
          isAbortError(err) ||
          requestId !== requestIdRef.current
        ) {
          return
        }
        setError(err)
        setStatus('error')
      })

    return () => {
      cancelled = true
      controller.abort()
      // queueMicrotask can't be cancelled; guarded by `cancelled`
      void start
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, retryCount])

  const retry = useCallback(() => {
    setRetryCount((n) => n + 1)
  }, [])

  const resolvedStatus = !enabled ? 'idle' : status

  return { status: resolvedStatus, data: enabled ? data : null, error, retry }
}
