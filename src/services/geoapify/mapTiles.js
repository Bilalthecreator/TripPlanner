import { getGeoapifyApiKey, requireGeoapifyApiKey } from './client.js'

/** Geoapify OSM-based raster tile styles suitable for Leaflet. */
export const GEOAPIFY_TILE_STYLES = {
  bright: 'osm-bright',
  soft: 'osm-bright-grey',
  dark: 'dark-matter-dark-grey',
}

/**
 * Leaflet-compatible tile URL template for Geoapify Maps.
 * https://maps.geoapify.com/v1/tile/{style}/{z}/{x}/{y}.png
 */
export function getGeoapifyTileUrl(style = GEOAPIFY_TILE_STYLES.soft) {
  const apiKey = requireGeoapifyApiKey()
  return `https://maps.geoapify.com/v1/tile/${style}/{z}/{x}/{y}.png?apiKey=${apiKey}`
}

export function getGeoapifyTileUrlSafe(style = GEOAPIFY_TILE_STYLES.soft) {
  const apiKey = getGeoapifyApiKey()
  if (!apiKey) return null
  return `https://maps.geoapify.com/v1/tile/${style}/{z}/{x}/{y}.png?apiKey=${apiKey}`
}

export const GEOAPIFY_MAP_ATTRIBUTION =
  'Powered by <a href="https://www.geoapify.com/" target="_blank" rel="noreferrer">Geoapify</a> | © OpenMapTiles © OpenStreetMap contributors'
