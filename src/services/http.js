import { MOCK_DELAY_MS, MOCK_ERROR_RATE } from './mockConfig.js'

export class MockRequestError extends Error {
  constructor(message = 'Something went wrong loading this section.') {
    super(message)
    this.name = 'MockRequestError'
  }
}

export class ApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export function delay(ms = MOCK_DELAY_MS, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError())
      return
    }

    const timer = setTimeout(() => {
      cleanup()
      resolve()
    }, ms)

    const onAbort = () => {
      cleanup()
      reject(createAbortError())
    }

    const cleanup = () => {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
    }

    signal?.addEventListener('abort', onAbort)
  })
}

function createAbortError() {
  const error = new Error('Request aborted')
  error.name = 'AbortError'
  return error
}

export function maybeFail(rate = MOCK_ERROR_RATE) {
  if (rate > 0 && Math.random() < rate) {
    throw new MockRequestError()
  }
}

export function isAbortError(error) {
  return error?.name === 'AbortError'
}

/**
 * JSON fetch with AbortSignal support. Does not swallow abort errors.
 */
export async function fetchJson(url, { signal, headers } = {}) {
  let response
  try {
    response = await fetch(url, {
      signal,
      headers: {
        Accept: 'application/json',
        ...headers,
      },
    })
  } catch (error) {
    if (isAbortError(error) || signal?.aborted) throw createAbortError()
    throw new ApiError(error?.message || 'Network request failed.')
  }

  if (!response.ok) {
    let detail = ''
    try {
      const body = await response.json()
      detail = body?.message || body?.error || body?.errors?.[0] || ''
    } catch {
      // ignore parse failures
    }
    throw new ApiError(
      detail || `Request failed (${response.status}).`,
      { status: response.status },
    )
  }

  return response.json()
}
