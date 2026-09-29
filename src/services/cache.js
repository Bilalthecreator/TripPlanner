/**
 * Lightweight in-memory TTL cache shared across discover API services.
 */

const store = new Map()

export function cacheGet(key) {
  const entry = store.get(key)
  if (!entry) return undefined
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    store.delete(key)
    return undefined
  }
  return entry.value
}

export function cacheSet(key, value, ttlMs = 5 * 60 * 1000) {
  store.set(key, {
    value,
    expiresAt: ttlMs > 0 ? Date.now() + ttlMs : 0,
  })
  return value
}

export function cacheKey(namespace, parts = []) {
  return `${namespace}:${parts.map((p) => String(p ?? '')).join('|')}`
}

export async function cached(key, ttlMs, loader) {
  const hit = cacheGet(key)
  if (hit !== undefined) return hit
  const value = await loader()
  return cacheSet(key, value, ttlMs)
}
