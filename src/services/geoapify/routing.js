import { cached, cacheKey } from '../cache.js'
import { geoapifyGet } from './client.js'

const ROUTING_TTL = 10 * 60 * 1000

/**
 * Geoapify Routing API between ordered waypoints.
 * https://api.geoapify.com/v1/routing
 */
export async function getRoute(
  waypoints,
  { mode = 'walk', signal } = {},
) {
  const points = (waypoints || []).filter(
    (p) =>
      Number.isFinite(Number(p.latitude)) &&
      Number.isFinite(Number(p.longitude)),
  )
  if (points.length < 2) return null

  const waypointsParam = points
    .map((p) => `${p.latitude},${p.longitude}`)
    .join('|')
  const key = cacheKey('geoapify:routing', [waypointsParam, mode])

  return cached(key, ROUTING_TTL, async () => {
    const payload = await geoapifyGet(
      '/v1/routing',
      {
        waypoints: waypointsParam,
        mode,
        format: 'geojson',
      },
      { signal },
    )

    const feature = payload?.features?.[0]
    if (!feature) return null

    const props = feature.properties || {}
    return {
      geometry: feature.geometry || null,
      distanceMeters: props.distance ?? null,
      timeSeconds: props.time ?? null,
      mode,
      waypoints: points,
    }
  })
}

export const routing = { getRoute }
