import { MOCK_DELAY_MS, MOCK_ERROR_RATE } from './mockConfig.js'

export class MockRequestError extends Error {
  constructor(message = 'Something went wrong loading this section.') {
    super(message)
    this.name = 'MockRequestError'
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
