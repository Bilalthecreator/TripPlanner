import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  GEOAPIFY_MAP_ATTRIBUTION,
  GEOAPIFY_TILE_STYLES,
  getGeoapifyTileUrlSafe,
} from '../../services/geoapify/mapTiles.js'
import { useTheme } from '../../store/useTheme.js'

const MARKER_COLORS = {
  destination: '#b90538',
  attraction: '#00685f',
  restaurant: '#b90538',
  hotel: '#00685f',
  accent: '#b90538',
  teal: '#00685f',
}

function markerIcon(color) {
  return L.divIcon({
    className: 'rw-map-marker',
    html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

/**
 * Interactive map using Leaflet + Geoapify OSM tiles.
 */
export function GeoapifyMap({
  latitude,
  longitude,
  markers = [],
  routeGeometry = null,
  className = 'h-72 w-full',
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const { theme } = useTheme()
  const markersKey = JSON.stringify(
    markers.map((m) => [m.id, m.latitude, m.longitude, m.type, m.tone]),
  )
  const routeKey = JSON.stringify(routeGeometry)

  useEffect(() => {
    if (!containerRef.current) return undefined
    if (!Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
      return undefined
    }

    const style =
      theme === 'dark'
        ? GEOAPIFY_TILE_STYLES.dark
        : GEOAPIFY_TILE_STYLES.soft
    const tileUrl = getGeoapifyTileUrlSafe(style)
    if (!tileUrl) return undefined

    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    const map = L.map(containerRef.current, {
      center: [latitude, longitude],
      zoom: 13,
      scrollWheelZoom: false,
      attributionControl: true,
    })

    L.tileLayer(tileUrl, {
      attribution: GEOAPIFY_MAP_ATTRIBUTION,
      maxZoom: 20,
    }).addTo(map)

    const points = []
    const list =
      markers.length > 0
        ? markers
        : [
            {
              id: 'center',
              name: 'Destination',
              latitude,
              longitude,
              type: 'destination',
            },
          ]

    list.forEach((marker) => {
      if (marker.latitude == null || marker.longitude == null) return
      const color =
        MARKER_COLORS[marker.type] ||
        MARKER_COLORS[marker.tone] ||
        MARKER_COLORS.accent
      const pin = L.marker([marker.latitude, marker.longitude], {
        icon: markerIcon(color),
        title: marker.name,
      }).addTo(map)
      if (marker.name) {
        pin.bindPopup(
          `<strong>${marker.name}</strong>${
            marker.type ? `<br/><span style="opacity:.7">${marker.type}</span>` : ''
          }`,
        )
      }
      points.push([marker.latitude, marker.longitude])
    })

    if (routeGeometry) {
      try {
        const routeLayer = L.geoJSON(routeGeometry, {
          style: {
            color: '#b90538',
            weight: 4,
            opacity: 0.85,
          },
        }).addTo(map)
        const bounds = routeLayer.getBounds()
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [28, 28], maxZoom: 14 })
        } else if (points.length > 1) {
          map.fitBounds(points, { padding: [28, 28], maxZoom: 14 })
        }
      } catch {
        if (points.length > 1) {
          map.fitBounds(points, { padding: [28, 28], maxZoom: 14 })
        }
      }
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [28, 28], maxZoom: 14 })
    }

    mapRef.current = map
    requestAnimationFrame(() => map.invalidateSize())

    return () => {
      map.remove()
      mapRef.current = null
    }
    // markersKey / routeKey keep array/object identity stable for the effect
  }, [latitude, longitude, markersKey, routeKey, theme, markers, routeGeometry])

  return <div ref={containerRef} className={className} />
}
