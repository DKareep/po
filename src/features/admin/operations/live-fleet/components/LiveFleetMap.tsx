import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { ShieldAlert } from 'lucide-react'
import type { LiveFleetResponseItem } from '../api/getLiveFleet'
import type { HubInventoryItem } from '../api/getHubsInventory'

// Set Mapbox token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''
mapboxgl.accessToken = MAPBOX_TOKEN

// Default center coordinates (NYC)
const DEFAULT_CENTER: [number, number] = [-74.006, 40.7128]

interface LiveFleetMapProps {
  allocations: LiveFleetResponseItem[]
  hubs: HubInventoryItem[]
  selectedAllocation: LiveFleetResponseItem | null
  onSelectAllocation: (alloc: LiveFleetResponseItem) => void
}

export function LiveFleetMap({
  allocations,
  hubs,
  selectedAllocation,
  onSelectAllocation,
}: LiveFleetMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Track map elements in refs to manage dynamically
  const vehicleMarkersRef = useRef<Record<string, mapboxgl.Marker>>({})
  const hubMarkersRef = useRef<Record<string, mapboxgl.Marker>>({})
  const activePopupRef = useRef<mapboxgl.Popup | null>(null)

  // 1. Initialize Map on mount
  useEffect(() => {
    if (!mapContainerRef.current) return
    if (mapRef.current) return // Already initialized

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: DEFAULT_CENTER,
      zoom: 11,
      trackResize: true,
    })

    mapRef.current = map

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      'bottom-right',
    )

    // Handle resize observer
    const resizeObserver = new ResizeObserver(() => {
      map.resize()
    })
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current)
    }

    map.on('load', () => {
      setMapLoaded(true)
    })

    return () => {
      resizeObserver.disconnect()
      if (activePopupRef.current) {
        activePopupRef.current.remove()
      }
      // Remove all vehicle markers
      Object.values(vehicleMarkersRef.current).forEach((m) => m.remove())
      // Remove all hub markers
      Object.values(hubMarkersRef.current).forEach((m) => m.remove())
      map.remove()
      mapRef.current = null
    }
  }, [])

  // 2. Sync Vehicle Markers when allocations list changes
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return

    const currentAllocIds = new Set(allocations.map((a) => a.allocationId))

    // Remove obsolete vehicle markers
    Object.keys(vehicleMarkersRef.current).forEach((id) => {
      if (!currentAllocIds.has(id)) {
        vehicleMarkersRef.current[id].remove()
        delete vehicleMarkersRef.current[id]
      }
    })

    // Create or update vehicle markers
    allocations.forEach((alloc) => {
      const { lat, lng } = alloc.gps
      if (isNaN(lat) || isNaN(lng)) return

      const existingMarker = vehicleMarkersRef.current[alloc.allocationId]

      if (existingMarker) {
        // Smooth transition/update marker position
        existingMarker.setLngLat([lng, lat])
      } else {
        // Create custom DOM element for truck marker
        const el = document.createElement('div')
        el.className =
          'relative flex items-center justify-center cursor-pointer'

        // Determine marker colors based on shiftStatus
        let colorClass = 'bg-accent-soft text-text' // inactive

        if (alloc.shiftStatus === 'active') {
          colorClass = 'bg-primary text-white border-2 border-white'

          const pulseRing = document.createElement('div')
          pulseRing.className =
            'absolute w-12 h-12 bg-primary/20 rounded-full animate-ping pointer-events-none'
          el.appendChild(pulseRing)
        } else if (alloc.shiftStatus === 'ended') {
          colorClass = 'bg-info text-white border-2 border-white'
        }

        const iconContainer = document.createElement('div')
        iconContainer.className = `w-10 h-10 ${colorClass} rounded-full flex flex-col items-center justify-center shadow-lg font-bold text-[8px] hover:scale-110 transition-transform duration-200`

        // Add Truck Icon SVG
        iconContainer.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="mb-0.5">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
            <path d="M19 18h2a1 1 0 0 0 1-1v-5.05a1.001 1.001 0 0 0-.253-.664l-3.323-3.8A1 1 0 0 0 17.677 7H14"/>
            <circle cx="7.5" cy="18.5" r="2.5"/>
            <circle cx="16.5" cy="18.5" r="2.5"/>
          </svg>
          <span style="font-size: 7px; margin-top:-2px;" class="tracking-tight">${alloc.vehicle?.registration.replace('TRK-', '') || ''}</span>
        `

        el.appendChild(iconContainer)

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([lng, lat])
          .addTo(map)

        // Sync clicked marker back to application state
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          onSelectAllocation(alloc)
        })

        vehicleMarkersRef.current[alloc.allocationId] = marker
      }
    })
  }, [allocations, mapLoaded, onSelectAllocation])

  // 3. Sync Hub/Terminal Markers once static hubs inventory is loaded
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded || hubs.length === 0) return

    // Remove existing hub markers
    Object.values(hubMarkersRef.current).forEach((m) => m.remove())
    hubMarkersRef.current = {}

    // Add hub markers
    hubs.forEach((hub) => {
      const { lat, lng } = hub.coordinates
      if (!lat || !lng) return

      const el = document.createElement('div')
      el.className = 'w-7 h-7 flex items-center justify-center cursor-pointer'

      const isTerminal = hub.type === 'terminal'
      const baseColor = isTerminal
        ? 'bg-indigo-600 text-white'
        : 'bg-amber-600 text-white'

      const inner = document.createElement('div')
      inner.className = `w-7 h-7 rounded-lg ${baseColor} border border-white/60 flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-200`

      // Icon
      inner.innerHTML = isTerminal
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 21h18M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7M12 2v20M5 7h14M8 12h8"/></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 21h18M3 10l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 21V9h6v12"/></svg>`

      el.appendChild(inner)

      const popup = new mapboxgl.Popup({ offset: 15 }).setHTML(`
        <div class="p-2.5 font-sans text-text max-w-[200px]">
          <div class="font-bold text-[9px] uppercase tracking-wider text-text-muted mb-1">
            ${hub.type === 'hub' ? 'Distribution Hub' : 'Supply Terminal'}
          </div>
          <h4 class="font-extrabold text-sm text-text mb-0.5 leading-tight">${hub.name}</h4>
          <p class="text-[11px] text-text-secondary leading-tight mb-2">${hub.address}</p>
          <div class="border-t border-border pt-2 space-y-1">
            <span class="block font-bold text-[9px] uppercase text-text-muted">Inventory Levels</span>
            <div class="grid grid-cols-3 gap-1 text-[10px] font-semibold">
              <div>Diesel: <span class="${hub.lowStockAlerts.diesel ? 'text-rose-600 font-bold' : 'text-text-secondary'}">${Math.round(hub.inventory.diesel / 1000)}kL</span></div>
              <div>Petrol: <span class="${hub.lowStockAlerts.petrol ? 'text-rose-600 font-bold' : 'text-text-secondary'}">${Math.round(hub.inventory.petrol / 1000)}kL</span></div>
              <div>Jet-A1: <span class="${hub.lowStockAlerts.jet_a1 ? 'text-rose-600 font-bold' : 'text-text-secondary'}">${Math.round(hub.inventory.jet_a1 / 1000)}kL</span></div>
            </div>
          </div>
        </div>
      `)

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map)

      hubMarkersRef.current[hub.id] = marker
    })
  }, [hubs, mapLoaded])

  // 4. Handle Programmatic Tooltip and Route Lines upon vehicle selection
  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapLoaded) return

    // Remove active popup
    if (activePopupRef.current) {
      activePopupRef.current.remove()
      activePopupRef.current = null
    }

    // Clean up previous route lines
    if (map.getLayer('route-glow')) map.removeLayer('route-glow')
    if (map.getLayer('route-line')) map.removeLayer('route-line')
    if (map.getSource('route')) map.removeSource('route')

    if (!selectedAllocation) return

    const { lat, lng } = selectedAllocation.gps
    if (isNaN(lat) || isNaN(lng)) return

    // Center map on selected truck
    map.flyTo({
      center: [lng, lat],
      zoom: 12.5,
      essential: true,
    })

    // Construct beautiful HTML content for driver info tooltip
    const totalOrders = selectedAllocation.orders.length
    const completedOrders = selectedAllocation.orders.filter(
      (o) => o.status === 'completed',
    ).length
    const ordersListHtml = selectedAllocation.orders
      .map(
        (o, idx) => `
      <div class="flex items-center justify-between text-xs py-1 border-b border-border last:border-0">
        <span class="font-medium text-text-secondary">Stop #${idx + 1}: Hub ID ${o.destinationId}</span>
        <div class="flex items-center gap-1.5">
          <span class="text-[10px] text-text-muted font-semibold ">${o.quantity}L ${o.product.toUpperCase()}</span>
          <span class="px-1.5 py-0.2 rounded border text-[8px] font-extrabold uppercase ${
            o.status === 'completed'
              ? 'bg-success-soft text-success border-success-border/30'
              : o.status === 'failed'
                ? 'bg-danger-soft text-danger border-danger-border/30'
                : 'bg-warning-soft text-warning border-warning-border/30'
          }">${o.status}</span>
        </div>
      </div>
    `,
      )
      .join('')

    const popupHtml = `
      <div class="p-3 font-sans text-text max-w-[240px]">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[9px] font-extrabold uppercase tracking-wider text-text-muted">Driver Details</span>
          <span class="px-2 py-0.5 rounded-full border text-[8px] font-black uppercase ${
            selectedAllocation.shiftStatus === 'active'
              ? 'bg-success-soft text-success border-success-border/30'
              : 'bg-bg-secondary text-text-secondary border-border'
          }">${selectedAllocation.shiftStatus}</span>
        </div>

        <h4 class="font-black text-sm text-text mb-0.5">${selectedAllocation.driver?.name || 'Unassigned'}</h4>
        <div class="text-xs  text-text-muted mb-2">Truck: ${selectedAllocation.vehicle?.registration || '--'} (${selectedAllocation.vehicle?.capacity}L)</div>

        ${
          selectedAllocation.driver?.phone
            ? `
          <div class="flex gap-1.5 mb-3">
            <a href="tel:${selectedAllocation.driver.phone}" class="flex-1 inline-flex items-center justify-center gap-1 bg-info-soft hover:bg-info-soft/80 text-info py-1.5 px-2 rounded-lg text-[10px] font-bold border border-info-border/50 transition-colors no-underline">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16"><path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.61 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.68.68 0 0 0-.58-.122l-2.19.547a1.75 1.75 0 0 1-1.657-.459L5.482 8.062a1.75 1.75 0 0 1-.46-1.657l.548-2.19a.68.68 0 0 0-.122-.58L3.654 1.328z"/></svg>
              Call
            </a>
            <a href="sms:${selectedAllocation.driver.phone}" class="flex-1 inline-flex items-center justify-center gap-1 bg-success-soft hover:bg-success-soft/80 text-success py-1.5 px-2 rounded-lg text-[10px] font-bold border border-success-border/50 transition-colors no-underline">
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              SMS
            </a>
          </div>
        `
            : ''
        }

        <div class="border-t border-border pt-2.5">
          <div class="flex justify-between items-center mb-1 text-[9px] uppercase tracking-wider text-text-muted font-extrabold">
            <span>Stops List</span>
            <span>${completedOrders}/${totalOrders} Completed</span>
          </div>
          ${totalOrders > 0 ? ordersListHtml : '<div class="text-[10px] text-text-muted italic">No orders assigned</div>'}
        </div>
      </div>
    `

    const popup = new mapboxgl.Popup({ offset: 30 })
      .setLngLat([lng, lat])
      .setHTML(popupHtml)
      .addTo(map)

    activePopupRef.current = popup

    // Draw route lines connecting the truck to its active orders destination hubs
    const pendingOrders = selectedAllocation.orders.filter(
      (o) => o.status === 'assigned' || o.status === 'pending',
    )

    let active = true

    if (pendingOrders.length > 0) {
      // Find hub locations for these pending orders
      const routeCoords: [number, number][] = [[lng, lat]] // start at truck

      pendingOrders.forEach((o) => {
        const destHub = hubs.find((h) => h.id === o.destinationId)
        if (destHub && destHub.coordinates.lat && destHub.coordinates.lng) {
          routeCoords.push([destHub.coordinates.lng, destHub.coordinates.lat])
        }
      })

      if (routeCoords.length > 1) {
        // Deduplicate sequential coordinate points to prevent directions API error
        const uniqueWaypoints: [number, number][] = []
        routeCoords.forEach((wp) => {
          if (uniqueWaypoints.length === 0) {
            uniqueWaypoints.push(wp)
          } else {
            const last = uniqueWaypoints[uniqueWaypoints.length - 1]
            if (
              Math.abs(last[0] - wp[0]) > 0.0001 ||
              Math.abs(last[1] - wp[1]) > 0.0001
            ) {
              uniqueWaypoints.push(wp)
            }
          }
        })

        const drawRoute = (coords: [number, number][]) => {
          if (!active || !map || !mapRef.current) return

          // Clean up previous route lines if they exist
          if (map.getLayer('route-glow')) map.removeLayer('route-glow')
          if (map.getLayer('route-line')) map.removeLayer('route-line')
          if (map.getSource('route')) map.removeSource('route')

          map.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: coords,
              },
            },
          })

          // Add glow layer
          map.addLayer({
            id: 'route-glow',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#fa6400',
              'line-width': 6,
              'line-opacity': 0.25,
            },
          })

          // Add main dash layer
          map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#fa6400',
              'line-width': 3,
              'line-opacity': 0.8,
              'line-dasharray': [2, 2.5],
            },
          })
        }

        const fetchRoute = async () => {
          if (MAPBOX_TOKEN && uniqueWaypoints.length > 1) {
            const coordsString = uniqueWaypoints
              .map((c) => `${c[0]},${c[1]}`)
              .join(';')
            try {
              const resp = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving/${coordsString}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`,
              )
              if (resp.ok) {
                const data = await resp.json()
                if (data.routes && data.routes.length > 0) {
                  const geometry = data.routes[0].geometry
                  if (geometry && geometry.coordinates) {
                    drawRoute(geometry.coordinates)
                    return
                  }
                }
              }
            } catch (err) {
              console.error('Directions API call failed:', err)
            }
          }
          // Fallback to straight lines
          drawRoute(uniqueWaypoints)
        }

        fetchRoute()
      }
    }

    return () => {
      active = false
    }
  }, [selectedAllocation, mapLoaded, hubs])

  return (
    <div className="flex-1 h-full w-full relative bg-bg">
      <div
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full rounded-r-xl"
      />

      {/* Floating Map Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="bg-surface/90 backdrop-blur-md px-3 py-2 rounded-lg border border-border shadow-md flex flex-col gap-1.5 text-[10px] font-bold text-text-secondary">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-primary border border-white animate-pulse" />
            <span>Active Shift</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-info border border-white" />
            <span>Ended Shift</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-soft border border-white" />
            <span>Off Duty / Inactive</span>
          </div>
          <div className="h-px bg-border my-1" />
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-amber-600 border border-white flex items-center justify-center text-white text-[8px] font-bold">
              H
            </div>
            <span>Distribution Hub</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-indigo-600 border border-white flex items-center justify-center text-white text-[8px] font-bold">
              T
            </div>
            <span>Supply Terminal</span>
          </div>
        </div>
      </div>

      {!MAPBOX_TOKEN && (
        <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex flex-col items-center justify-center z-[20] p-6 text-center">
          <ShieldAlert size={32} className="text-danger mb-2" />
          <span className="font-bold text-text">
            Mapbox Access Token Missing
          </span>
          <span className="text-xs text-text-muted mt-1">
            Please set VITE_MAPBOX_TOKEN in your environment.
          </span>
        </div>
      )}
    </div>
  )
}
