import { cached, cacheKey } from './cache.js'
import { fetchJson, isAbortError } from './http.js'

const IMAGE_TTL = 60 * 60 * 1000
const WIKI_API = 'https://en.wikipedia.org/w/api.php'
const WIKI_SUMMARY = 'https://en.wikipedia.org/api/rest_v1/page/summary'

function throwIfAborted(signal) {
  if (signal?.aborted) {
    const error = new Error('Request aborted')
    error.name = 'AbortError'
    throw error
  }
}

function attributionFromSummary(summary) {
  const title = summary?.title || summary?.titles?.normalized || 'Wikipedia'
  const pageUrl =
    summary?.content_urls?.desktop?.page ||
    `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`

  return {
    source: 'wikipedia',
    label: title,
    sourceLabel: 'Wikipedia',
    pageUrl,
    // Keep photographer-shaped fields for existing card attribution UI.
    photographer: title,
    photographerUrl: pageUrl,
    sourceUrl: pageUrl,
  }
}

/**
 * Resolve the best Wikipedia article title for a free-text destination query.
 */
async function searchWikipediaTitle(query, { signal } = {}) {
  const url = new URL(WIKI_API)
  url.searchParams.set('action', 'query')
  url.searchParams.set('list', 'search')
  url.searchParams.set('srsearch', query)
  url.searchParams.set('srlimit', '1')
  url.searchParams.set('format', 'json')
  url.searchParams.set('origin', '*')

  const payload = await fetchJson(url.toString(), { signal })
  const hit = payload?.query?.search?.[0]
  return hit?.title || null
}

/**
 * Fetch a Wikipedia page summary (includes thumbnail / original image when present).
 */
async function getPageSummary(title, { signal } = {}) {
  if (!title) return null
  const url = `${WIKI_SUMMARY}/${encodeURIComponent(title)}`
  return fetchJson(url, {
    signal,
    headers: {
      Accept: 'application/json',
    },
  })
}

function imageFromSummary(summary) {
  if (!summary || summary.type === 'disambiguation') return null
  const original = summary.originalimage?.source
  const thumb = summary.thumbnail?.source
  const url = original || thumb
  if (!url) return null

  return {
    url,
    thumb: thumb || url,
    attribution: attributionFromSummary(summary),
    title: summary.title,
    extract: summary.extract || null,
  }
}

/**
 * Search Wikipedia for a destination and return its lead/thumbnail image.
 * Returns null when no image exists or the request fails — callers must fall back.
 */
export async function getDestinationImage(query, { signal } = {}) {
  const summary = await getDestinationSummary(query, { signal })
  if (!summary) return null
  if (!summary.imageUrl) {
    return {
      url: null,
      thumb: null,
      attribution: summary.attribution,
      title: summary.title,
      extract: summary.extract,
    }
  }
  return {
    url: summary.imageUrl,
    thumb: summary.thumbUrl || summary.imageUrl,
    attribution: summary.attribution,
    title: summary.title,
    extract: summary.extract,
  }
}

/**
 * Full Wikipedia summary for Destination Details (title, extract, image).
 */
export async function getDestinationSummary(query, { signal } = {}) {
  const q = String(query || '').trim()
  if (!q) return null

  const key = cacheKey('wikimedia:summary', [q.toLowerCase()])
  return cached(key, IMAGE_TTL, async () => {
    try {
      throwIfAborted(signal)

      let summary = null
      try {
        summary = await getPageSummary(q, { signal })
      } catch (error) {
        if (isAbortError(error)) throw error
        summary = null
      }

      if (!summary || summary.type === 'disambiguation' || !summary.extract) {
        throwIfAborted(signal)
        const title = await searchWikipediaTitle(q, { signal })
        if (title && title !== summary?.title) {
          throwIfAborted(signal)
          summary = await getPageSummary(title, { signal })
        }
      }

      if (!summary || summary.type === 'disambiguation') return null

      const image = imageFromSummary(summary)
      const extract = shortenExtract(summary.extract)

      return {
        title: summary.title,
        extract,
        description: summary.description || null,
        imageUrl: image?.url || null,
        thumbUrl: image?.thumb || null,
        attribution: attributionFromSummary(summary),
        pageUrl: attributionFromSummary(summary).pageUrl,
        coordinates: summary.coordinates || null,
      }
    } catch (error) {
      if (isAbortError(error)) throw error
      return null
    }
  })
}

function shortenExtract(text, maxChars = 320) {
  const raw = String(text || '').trim()
  if (!raw) return ''
  if (raw.length <= maxChars) return raw
  const sliced = raw.slice(0, maxChars)
  const lastStop = Math.max(
    sliced.lastIndexOf('. '),
    sliced.lastIndexOf('! '),
    sliced.lastIndexOf('? '),
  )
  if (lastStop > maxChars * 0.5) return sliced.slice(0, lastStop + 1).trim()
  return `${sliced.trim()}…`
}

/**
 * Optional geosearch helper — nearby Wikipedia pages that have images.
 */
export async function getNearbyPageImages(
  latitude,
  longitude,
  { radius = 10000, limit = 5, signal } = {},
) {
  const lat = Number(latitude)
  const lon = Number(longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return []

  const key = cacheKey('wikimedia:geo', [
    lat.toFixed(3),
    lon.toFixed(3),
    radius,
    limit,
  ])

  return cached(key, IMAGE_TTL, async () => {
    try {
      const url = new URL(WIKI_API)
      url.searchParams.set('action', 'query')
      url.searchParams.set('list', 'geosearch')
      url.searchParams.set('gscoord', `${lat}|${lon}`)
      url.searchParams.set('gsradius', String(radius))
      url.searchParams.set('gslimit', String(limit))
      url.searchParams.set('format', 'json')
      url.searchParams.set('origin', '*')

      const payload = await fetchJson(url.toString(), { signal })
      const pages = payload?.query?.geosearch || []
      const images = []

      for (const page of pages) {
        throwIfAborted(signal)
        try {
          const summary = await getPageSummary(page.title, { signal })
          const image = imageFromSummary(summary)
          if (image) images.push({ ...image, pageId: page.pageid, distance: page.dist })
        } catch (error) {
          if (isAbortError(error)) throw error
        }
      }

      return images
    } catch (error) {
      if (isAbortError(error)) throw error
      return []
    }
  })
}

export const wikimediaService = {
  getDestinationImage,
  getDestinationSummary,
  getNearbyPageImages,
}

export default wikimediaService
