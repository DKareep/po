import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useTodaysShift } from '../todays-shift/hooks/useTodaysShift'
import { useUpdateGps } from './hooks/useUpdateGps'
import { type DriverOrder } from '../todays-shift/types/shift.types'
import { toast } from 'sonner'
import {
  Truck,
  Play,
  Square,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Navigation,
  Send,
  Compass,
} from 'lucide-react'

// Set Mapbox token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''
mapboxgl.accessToken = MAPBOX_TOKEN

// Default center coordinates (NYC)
const DEFAULT_CENTER: [number, number] = [-74.006, 40.7128]

export default function MapPage() {
  const { data: shiftData, isLoading, refetch, isRefetching } = useTodaysShift()
  const { mutate: updateGpsMutate, isPending: isUpdatingGps } = useUpdateGps()

  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const driverMarkerRef = useRef<mapboxgl.Marker | null>(null)
  const destinationMarkersRef = useRef<mapboxgl.Marker[]>([])

  // Simulation states
  const [simulatedLocation, setSimulatedLocation] = useState<
    [number, number] | null
  >(null)
  const [stableTruckLocation, setStableTruckLocation] = useState<
    [number, number] | null
  >(null)
  const [isAutoSimulating, setIsAutoSimulating] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<DriverOrder | null>(null)
  const [routeLineExists, setRouteLineExists] = useState(false)
  const [staticRouteCoords, setStaticRouteCoords] = useState<
    [number, number][]
  >([])
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null)
  const [currentRouteStep, setCurrentRouteStep] = useState(0)
  const currentRouteStepRef = useRef(0)

  // Reset step whenever staticRouteCoords changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentRouteStep(0)
    }, 0)
    currentRouteStepRef.current = 0
    return () => clearTimeout(timer)
  }, [staticRouteCoords])

  // Keep step ref in sync with state
  useEffect(() => {
    currentRouteStepRef.current = currentRouteStep
  }, [currentRouteStep])

  // Simulation variables
  const autoDriveIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Refs to ensure initialization runs exactly once
  const isLocationInitializedRef = useRef(false)
  const isMapSyncedRef = useRef(false)

  // 1. Initialize simulatedLocation and stableTruckLocation state when shiftData loads
  useEffect(() => {
    if (isLoading || !shiftData) return
    if (isLocationInitializedRef.current) return // Already initialized

    let targetLocation = DEFAULT_CENTER

    if (
      shiftData.gps &&
      !isNaN(Number(shiftData.gps.lng)) &&
      !isNaN(Number(shiftData.gps.lat))
    ) {
      targetLocation = [Number(shiftData.gps.lng), Number(shiftData.gps.lat)]
    } else if (shiftData.orders && shiftData.orders.length > 0) {
      // Fallback to first order destination coordinates
      const firstOrder = shiftData.orders[0]
      if (firstOrder.destinationDetails?.coordinates) {
        const coords = firstOrder.destinationDetails.coordinates
        targetLocation = [coords.lng, coords.lat]
      }
    }

    isLocationInitializedRef.current = true
    setSimulatedLocation(targetLocation)
    setStableTruckLocation(targetLocation)
  }, [shiftData, isLoading])

  // 1.5 Sync map center and marker when simulatedLocation first becomes available
  useEffect(() => {
    if (!mapInstance || !driverMarkerRef.current || !simulatedLocation) return
    if (isMapSyncedRef.current) return // Only sync initial center once

    isMapSyncedRef.current = true
    driverMarkerRef.current.setLngLat(simulatedLocation)
    mapInstance.setCenter(simulatedLocation)
  }, [simulatedLocation, mapInstance])

  // 2. Initialize and manage the Mapbox Map instance once on mount
  useEffect(() => {
    if (!mapContainerRef.current) return
    if (mapRef.current) return // Already initialized

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: DEFAULT_CENTER,
      zoom: 12,
      trackResize: true,
    })

    mapRef.current = map
    setMapInstance(map)

    // Add navigation controls
    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      'bottom-right',
    )

    // Handle resize automatically
    const resizeObserver = new ResizeObserver(() => {
      map.resize()
    })
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current)
    }

    // Create custom element for driver marker (pulsing truck icon)
    const el = document.createElement('div')
    el.className = 'relative flex items-center justify-center'

    const pulseRing = document.createElement('div')
    pulseRing.className =
      'absolute w-12 h-12 bg-primary/20 rounded-full animate-ping pointer-events-none'

    const iconContainer = document.createElement('div')
    iconContainer.className =
      'w-10 h-10 bg-primary border-2 border-white rounded-full flex items-center justify-center shadow-lg text-white cursor-grab active:cursor-grabbing hover:scale-105 transition-transform'

    // Truck SVG Icon
    iconContainer.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
        <path d="M19 18h2a1 1 0 0 0 1-1v-5.05a1.001 1.001 0 0 0-.253-.664l-3.323-3.8A1 1 0 0 0 17.677 7H14"/>
        <circle cx="7.5" cy="18.5" r="2.5"/>
        <circle cx="16.5" cy="18.5" r="2.5"/>
      </svg>
    `

    el.appendChild(pulseRing)
    el.appendChild(iconContainer)

    const driverMarker = new mapboxgl.Marker({
      element: el,
      draggable: true,
    })
      .setLngLat(DEFAULT_CENTER)
      .addTo(map)

    driverMarkerRef.current = driverMarker

    // Listen to manual drags
    driverMarker.on('drag', () => {
      const lngLat = driverMarker.getLngLat()
      setSimulatedLocation([lngLat.lng, lngLat.lat])
    })

    driverMarker.on('dragend', () => {
      const lngLat = driverMarker.getLngLat()
      const newPos: [number, number] = [lngLat.lng, lngLat.lat]
      setSimulatedLocation(newPos)
      setStableTruckLocation(newPos)
      toast.info(
        'Truck location updated locally. Click "Send GPS Update" to sync with dispatcher.',
      )
    })

    map.on('load', () => {
      setRouteLineExists(true)
    })

    return () => {
      resizeObserver.disconnect()
      map.remove()
      mapRef.current = null
      driverMarkerRef.current = null
    }
  }, [])

  // 3. Keep driver marker in sync with state changes (especially during auto-simulation)
  useEffect(() => {
    if (!driverMarkerRef.current || !simulatedLocation) return
    const markerLngLat = driverMarkerRef.current.getLngLat()

    // Only update if difference is substantial (prevent update loops during drag)
    const diffLng = Math.abs(markerLngLat.lng - simulatedLocation[0])
    const diffLat = Math.abs(markerLngLat.lat - simulatedLocation[1])
    if (diffLng > 0.00001 || diffLat > 0.00001) {
      driverMarkerRef.current.setLngLat(simulatedLocation)

      // Center map on truck if auto-simulating so it follows the truck
      if (isAutoSimulating && mapRef.current) {
        mapRef.current.setCenter(simulatedLocation)
      }
    }
  }, [simulatedLocation, isAutoSimulating])

  // 4. Update destination markers when orders change or map initializes
  useEffect(() => {
    const map = mapInstance
    if (!map || !shiftData?.orders) return

    // Clear existing markers
    destinationMarkersRef.current.forEach((m) => m.remove())
    destinationMarkersRef.current = []

    shiftData.orders.forEach((order, index) => {
      if (!order.destinationDetails?.coordinates) return
      const { lat, lng } = order.destinationDetails.coordinates

      // Outer element - Mapbox will apply absolute positioning transforms to this
      const markerEl = document.createElement('div')
      markerEl.className = 'w-8 h-8 flex items-center justify-center'

      let markerColor = 'bg-warning text-text-inverse' // pending/assigned -> yellow
      if (order.status === 'completed') markerColor = 'bg-success text-white'
      if (order.status === 'failed') markerColor = 'bg-danger text-white'

      // Inner element - handles layout and hover scale animations safely without breaking Mapbox positioning
      const innerEl = document.createElement('div')
      innerEl.className = `w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-md font-bold text-xs cursor-pointer hover:scale-115 transition-transform duration-200 ${markerColor}`
      innerEl.innerText = String(index + 1)
      markerEl.appendChild(innerEl)

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2 font-sans text-[#1e293b]">
          <div class="font-bold text-[9px] uppercase tracking-wider text-[#64748b] mb-1">Stop #${index + 1}</div>
          <h4 class="font-extrabold text-sm text-[#0f172a] mb-0.5">${order.destinationDetails.name}</h4>
          <p class="text-xs text-[#475569] leading-tight mb-2">${order.destinationDetails.address}</p>
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              order.status === 'completed'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : order.status === 'failed'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200' // yellow warning status badge for pending
            }">
              ${order.status === 'assigned' ? 'pending' : order.status}
            </span>
            <span class="text-xs font-semibold text-[#475569]">
              ${order.quantity}L ${order.product.toUpperCase()}
            </span>
          </div>
        </div>
      `)

      const marker = new mapboxgl.Marker({ element: markerEl })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map)

      // Sync selection on click
      innerEl.addEventListener('click', () => {
        setSelectedOrder(order)
        map.flyTo({ center: [lng, lat], zoom: 14 })
      })

      destinationMarkersRef.current.push(marker)
    })
  }, [shiftData?.orders, mapInstance])

  // 4.5 Resolve static road routes between destinations when orders change or truck is dropped (prevents Directions API spam)
  useEffect(() => {
    if (!shiftData?.orders) return

    const activeWaypoints = shiftData.orders
      .filter(
        (o) => o.status !== 'completed' && o.destinationDetails?.coordinates,
      )
      .map((o) => [
        Number(o.destinationDetails!.coordinates.lng),
        Number(o.destinationDetails!.coordinates.lat),
      ]) as [number, number][]

    if (activeWaypoints.length === 0) {
      const timer = setTimeout(() => {
        setStaticRouteCoords([])
      }, 0)
      return () => clearTimeout(timer)
    }

    // Deduplicate sequential coordinate points to prevent directions API error
    const uniqueWaypoints: [number, number][] = []
    activeWaypoints.forEach((wp) => {
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

    const fetchDirections = async () => {
      if (MAPBOX_TOKEN && uniqueWaypoints.length > 0) {
        // Start road route from stable truck location (initial or drop location)
        const allCoords = stableTruckLocation
          ? [stableTruckLocation, ...uniqueWaypoints]
          : uniqueWaypoints

        const coordsString = allCoords.map((c) => `${c[0]},${c[1]}`).join(';')

        try {
          const resp = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${coordsString}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`,
          )
          if (resp.ok) {
            const data = await resp.json()
            if (data.routes && data.routes.length > 0) {
              const geometry = data.routes[0].geometry
              if (geometry && geometry.coordinates) {
                setStaticRouteCoords(geometry.coordinates)
                return
              }
            }
          }
        } catch (err) {
          console.error('Directions API call failed:', err)
        }
      }

      // Fallback: use straight geodesic lines
      setTimeout(() => {
        setStaticRouteCoords(uniqueWaypoints)
      }, 0)
    }

    fetchDirections()
  }, [shiftData?.orders, stableTruckLocation])

  // 5. Draw and animate the Route Line by prepending simulated truck location to static coordinates (zero network latency)
  useEffect(() => {
    const map = mapInstance
    if (!map || !simulatedLocation || !routeLineExists) return

    // Slice route line coordinates from currentRouteStep onwards so we don't draw lines behind the truck
    const nextOrder = shiftData?.orders.find((o) => o.status !== 'completed')
    const fallbackCoords = nextOrder?.destinationDetails?.coordinates
      ? [
          [
            nextOrder.destinationDetails.coordinates.lng,
            nextOrder.destinationDetails.coordinates.lat,
          ] as [number, number],
        ]
      : []

    const remainingCoords =
      staticRouteCoords.length > 0
        ? staticRouteCoords.slice(currentRouteStep)
        : fallbackCoords

    const combinedCoords = [simulatedLocation, ...remainingCoords]

    // Update or create source
    const existingSource = map.getSource('route') as mapboxgl.GeoJSONSource
    if (existingSource) {
      existingSource.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: combinedCoords,
        },
      })
    } else {
      map.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: combinedCoords,
          },
        },
      })

      // Glowing shadow line
      map.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#3b82f6', // primary blue
          'line-width': 8,
          'line-opacity': 0.3,
        },
      })

      // Main dash route line
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#60a5fa', // lighter neon blue
          'line-width': 4,
          'line-opacity': 0.85,
          'line-dasharray': [1.5, 2],
        },
      })
    }
  }, [
    simulatedLocation,
    staticRouteCoords,
    currentRouteStep,
    routeLineExists,
    shiftData?.orders,
    mapInstance,
  ])

  // 6. Manage Auto-Drive Simulation interval (moves along the points of the road route geometry)
  useEffect(() => {
    if (isAutoSimulating) {
      // Find first non-completed order to drive towards
      const nextOrder = shiftData?.orders.find((o) => o.status !== 'completed')
      if (!nextOrder || !nextOrder.destinationDetails?.coordinates) {
        const timer = setTimeout(() => {
          setIsAutoSimulating(false)
        }, 0)
        return () => clearTimeout(timer)
      }

      const destLng = Number(nextOrder.destinationDetails.coordinates.lng)
      const destLat = Number(nextOrder.destinationDetails.coordinates.lat)

      autoDriveIntervalRef.current = setInterval(() => {
        setSimulatedLocation((curr) => {
          if (!curr) return null

          // Determine target coordinate (either next point on road route or final destination)
          let targetLng = destLng
          let targetLat = destLat
          let isFollowingRoad = false

          const step = currentRouteStepRef.current
          if (staticRouteCoords.length > 0 && step < staticRouteCoords.length) {
            const roadPoint = staticRouteCoords[step]
            targetLng = roadPoint[0]
            targetLat = roadPoint[1]
            isFollowingRoad = true
          }

          const dx = targetLng - curr[0]
          const dy = targetLat - curr[1]
          const distance = Math.sqrt(dx * dx + dy * dy)

          // Constant movement speed per tick (~0.00035 degrees, approx 35 meters)
          const speed = 0.00035

          // Check if arrived at the final destination
          const dxDest = destLng - curr[0]
          const dyDest = destLat - curr[1]
          const distToDest = Math.sqrt(dxDest * dxDest + dyDest * dyDest)

          if (distToDest < 0.0005) {
            setIsAutoSimulating(false)
            if (autoDriveIntervalRef.current) {
              clearInterval(autoDriveIntervalRef.current)
            }
            toast.success(
              `You have arrived at: ${nextOrder.destinationDetails?.name}!`,
            )

            // Sync with dispatcher immediately on arrival
            updateGpsMutate({ lat: destLat, lng: destLng })
            return [destLng, destLat]
          }

          // Move to the next road point or step closer
          if (isFollowingRoad && distance <= speed) {
            // Advance to next road waypoint
            setCurrentRouteStep((prev) => {
              const nextStep = prev + 1
              currentRouteStepRef.current = nextStep
              return nextStep
            })
            return [targetLng, targetLat]
          } else {
            // Standard step towards target
            const stepRatio = distance > 0 ? speed / distance : 1
            const nextLng = curr[0] + dx * Math.min(1, stepRatio)
            const nextLat = curr[1] + dy * Math.min(1, stepRatio)
            return [nextLng, nextLat]
          }
        })
      }, 150)
    } else {
      if (autoDriveIntervalRef.current) {
        clearInterval(autoDriveIntervalRef.current)
        autoDriveIntervalRef.current = null
      }
    }

    return () => {
      if (autoDriveIntervalRef.current) {
        clearInterval(autoDriveIntervalRef.current)
      }
    }
  }, [isAutoSimulating, shiftData?.orders, staticRouteCoords, updateGpsMutate])

  // 7. Handlers
  const handleSendGpsUpdate = () => {
    if (!simulatedLocation) return

    updateGpsMutate(
      {
        lat: Number(simulatedLocation[1].toFixed(6)),
        lng: Number(simulatedLocation[0].toFixed(6)),
      },
      {
        onSuccess: () => {
          toast.success('GPS ping successfully sent to dispatcher!')
          refetch()
        },
        onError: () => {
          toast.error('Failed to sync GPS update with server.')
        },
      },
    )
  }

  const handleToggleSimulation = () => {
    if (!isAutoSimulating) {
      // Find first non-completed order to drive towards
      const nextOrder = shiftData?.orders.find((o) => o.status !== 'completed')
      if (
        !nextOrder ||
        !nextOrder.destinationDetails?.coordinates ||
        !simulatedLocation
      ) {
        toast.info('No pending destinations to simulate routing.')
        return
      }
      setIsAutoSimulating(true)
    } else {
      setIsAutoSimulating(false)
    }
  }

  const handlePanToTruck = () => {
    if (!mapRef.current || !simulatedLocation) return
    mapRef.current.flyTo({
      center: simulatedLocation,
      zoom: 13,
      essential: true,
    })
  }

  // State computations

  const activeShift = shiftData?.shift?.status === 'active'
  const nextPendingOrder = shiftData?.orders.find(
    (o) => o.status !== 'completed',
  )

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] w-full overflow-hidden bg-bg rounded-xl border border-border">
      {/* Side Control Panel */}
      <div className="w-full lg:w-96 flex flex-col border-r border-border bg-surface/50 backdrop-blur-md overflow-y-auto shrink-0 p-5 space-y-6">
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black text-text tracking-tight flex items-center gap-2">
              <Compass className="text-primary animate-spin-slow" size={22} />
              GPS Navigation
            </h1>

            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="p-1.5 rounded-lg border border-border bg-surface hover:bg-surface-hover text-text transition-colors disabled:opacity-50"
              title="Refresh Shift Data"
            >
              <RefreshCw
                size={14}
                className={isRefetching ? 'animate-spin' : ''}
              />
            </button>
          </div>

          <p className="text-xs text-text-secondary mt-1">
            Simulate real-time vehicle route tracking and dispatch
            notifications.
          </p>
        </div>

        {/* Shift Details Info Card */}
        <div className="rounded-xl border border-border bg-surface p-4 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Shift Status
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                activeShift
                  ? 'bg-success/15 text-success border border-success-border/30'
                  : 'bg-text-secondary/10 text-text-secondary border border-border'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${activeShift ? 'bg-success animate-pulse' : 'bg-text-secondary'}`}
              />
              {activeShift ? 'Active Shift' : 'Inactive'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs border-t border-border/60 pt-3">
            <div>
              <span className="block text-text-muted">Assigned Truck</span>
              <span className="font-bold text-text mt-0.5 block truncate">
                {shiftData?.vehicle?.registration || 'None Allocated'}
              </span>
            </div>
            <div>
              <span className="block text-text-muted">Capacity</span>
              <span className="font-bold text-text mt-0.5 block">
                {shiftData?.vehicle?.capacity
                  ? `${shiftData.vehicle.capacity} L`
                  : '--'}
              </span>
            </div>
          </div>
        </div>

        {/* Simulated Coordinate Metrics & Update GPS button */}
        <div className="rounded-xl border border-border bg-surface p-4 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            Simulated GPS Position
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs bg-bg-secondary p-3 rounded-lg border border-border/50 font-mono">
            <div>
              <span className="text-text-muted text-[10px] uppercase">
                Longitude
              </span>
              <span className="font-semibold text-text block mt-0.5 truncate">
                {simulatedLocation ? simulatedLocation[0].toFixed(6) : '--'}
              </span>
            </div>
            <div>
              <span className="text-text-muted text-[10px] uppercase">
                Latitude
              </span>
              <span className="font-semibold text-text block mt-0.5 truncate">
                {simulatedLocation ? simulatedLocation[1].toFixed(6) : '--'}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handlePanToTruck}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface hover:bg-surface-hover py-2 px-3 text-xs font-semibold text-text transition-colors"
            >
              <Navigation size={14} className="text-text-secondary rotate-45" />
              Locate
            </button>

            <button
              onClick={handleSendGpsUpdate}
              disabled={isUpdatingGps || !simulatedLocation}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover py-2 px-3 text-xs font-semibold text-text-inverse transition-colors shadow-sm disabled:opacity-50"
            >
              {isUpdatingGps ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Send size={14} />
              )}
              Ping Dispatch
            </button>
          </div>
        </div>

        {/* Simulation Mode Selector */}
        <div className="rounded-xl border border-border bg-surface p-4 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
              Simulation Controls
            </h3>
            {isAutoSimulating && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-primary animate-pulse uppercase">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Driving...
              </span>
            )}
          </div>

          <div className="text-xs text-text-secondary leading-relaxed bg-bg-secondary p-3 rounded-lg border border-border/50">
            <span className="font-semibold text-text">
              How to simulate movement:
            </span>
            <ul className="list-disc list-inside space-y-1 mt-1.5 pl-0.5 text-text-muted">
              <li>Drag the blue truck marker on the map manually.</li>
              <li>Or click "Start Auto-Drive" to drive dynamically.</li>
            </ul>
          </div>

          <button
            onClick={handleToggleSimulation}
            disabled={!nextPendingOrder}
            className={`w-full inline-flex items-center justify-center gap-2 rounded-lg py-2.5 px-4 text-xs font-bold transition-all shadow-sm ${
              isAutoSimulating
                ? 'bg-danger text-text-inverse hover:bg-danger-hover'
                : 'bg-primary-soft text-primary hover:bg-primary-soft-hover border border-primary-border/40'
            } disabled:opacity-50`}
          >
            {isAutoSimulating ? (
              <>
                <Square size={14} fill="currentColor" />
                Stop Simulation
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" />
                Start Auto-Drive
              </>
            )}
          </button>
        </div>

        {/* Delivery Waypoints List */}
        <div className="space-y-3.5">
          <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider">
            Today's Route Schedule
          </h3>

          {/* Sidebar Route Legend */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-bg-secondary rounded-lg border border-border/50 text-[10px] font-semibold text-text-secondary shadow-inner">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-warning border border-white animate-pulse" />
              <span>Pending Stop</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-success border border-white" />
              <span>Completed Stop</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-danger border border-white" />
              <span>Failed Stop</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary border border-white text-text-inverse">
                <Truck size={10} />
              </div>
              <span>Truck (Draggable)</span>
            </div>
          </div>

          {!shiftData?.orders || shiftData.orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-border rounded-xl">
              <AlertCircle size={20} className="text-text-muted mb-2" />
              <span className="text-xs text-text-secondary">
                No deliveries assigned for today's shift.
              </span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {shiftData.orders.map((order, index) => {
                const isSelected = selectedOrder?.id === order.id
                const isNext = nextPendingOrder?.id === order.id

                return (
                  <div
                    key={order.id}
                    onClick={() => {
                      setSelectedOrder(order)
                      if (
                        order.destinationDetails?.coordinates &&
                        mapRef.current
                      ) {
                        mapRef.current.flyTo({
                          center: [
                            order.destinationDetails.coordinates.lng,
                            order.destinationDetails.coordinates.lat,
                          ],
                          zoom: 14,
                        })
                      }
                    }}
                    className={`group relative flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer shadow-sm transition-all ${
                      isSelected
                        ? 'border-primary bg-primary-soft/50 ring-1 ring-primary/30'
                        : isNext
                          ? 'border-border bg-surface-muted ring-1 ring-border/50'
                          : 'border-border bg-surface hover:border-border-hover'
                    }`}
                  >
                    {/* Index Badge indicator */}
                    <div>
                      <div
                        className={`flex w-6 h-6 shrink-0 rounded-full items-center justify-center text-xs font-bold border ${
                          order.status === 'completed'
                            ? 'bg-success/15 border-success/30 text-success'
                            : order.status === 'failed'
                              ? 'bg-danger/15 border-danger/30 text-danger'
                              : 'bg-warning/15 border-warning/30 text-warning'
                        }`}
                      >
                        {index + 1}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="font-bold text-xs text-text truncate block">
                          {order.destinationDetails?.name || 'Unnamed Stop'}
                        </span>

                        {order.status === 'completed' && (
                          <CheckCircle2
                            size={13}
                            className="text-success shrink-0"
                          />
                        )}
                        {order.status === 'failed' && (
                          <XCircle size={13} className="text-danger shrink-0" />
                        )}
                      </div>

                      <span className="text-[10px] text-text-muted truncate block mt-0.5">
                        {order.destinationDetails?.address}
                      </span>

                      <div className="flex items-center justify-between gap-1.5 mt-2 border-t border-border/30 pt-1.5">
                        <span className="text-[10px] font-semibold text-text-secondary">
                          {order.quantity} Liters •{' '}
                          {order.product.toUpperCase()}
                        </span>

                        {isNext && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase text-primary tracking-wide">
                            <Truck size={10} className="animate-bounce" />
                            Next Stop
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Map Window Container */}
      <div className="flex-1 relative h-[450px] lg:h-full min-h-[300px]">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

        {/* Loading Overlay */}
        {!simulatedLocation && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-surface/90 backdrop-blur-md rounded-xl">
            <RefreshCw className="animate-spin text-primary" size={32} />
            <span className="text-sm font-semibold text-text-secondary animate-pulse">
              Initializing GPS Live Map...
            </span>
          </div>
        )}

        {/* Floating overlays for Mapbox */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {isAutoSimulating && nextPendingOrder && (
            <div className="bg-surface/90 backdrop-blur-md border border-border px-3.5 py-2 rounded-xl shadow-lg flex items-center gap-2.5 text-xs text-text animate-pulse">
              <Truck className="text-primary" size={16} />
              <div>
                <span className="font-semibold block text-[10px] text-text-secondary uppercase">
                  Auto-Pilot Mode
                </span>
                <span className="text-text font-bold">
                  Driving to {nextPendingOrder.destinationDetails?.name}
                </span>
              </div>
            </div>
          )}

          {selectedOrder && (
            <div className="bg-surface/95 backdrop-blur-md border border-border p-3.5 rounded-xl shadow-lg max-w-sm flex flex-col gap-1.5 text-xs text-text relative group">
              <button
                onClick={() => setSelectedOrder(null)}
                className="absolute top-2 right-2 text-text-muted hover:text-text hover:bg-surface-hover p-1 rounded-md transition-colors"
              >
                <XCircle size={14} />
              </button>
              <span className="text-text-muted text-[10px] font-bold uppercase tracking-wider">
                Focused Destination
              </span>
              <span className="font-black text-text pr-4">
                {selectedOrder.destinationDetails?.name}
              </span>
              <span className="text-text-secondary font-medium leading-normal">
                {selectedOrder.destinationDetails?.address}
              </span>
              <div className="flex items-center gap-2 border-t border-border/50 pt-2 mt-1">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    selectedOrder.status === 'completed'
                      ? 'bg-success/20 text-success'
                      : selectedOrder.status === 'failed'
                        ? 'bg-danger/20 text-danger'
                        : 'bg-warning/20 text-warning'
                  }`}
                >
                  {selectedOrder.status}
                </span>
                <span className="font-bold text-text-secondary">
                  {selectedOrder.quantity}L of {selectedOrder.product}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="absolute bottom-12 left-4 z-30 bg-surface/95 backdrop-blur-md border border-border px-3.5 py-2.5 rounded-xl shadow-xl flex flex-col gap-2 text-[10px] font-semibold text-text-secondary">
          <div className="text-[9px] uppercase tracking-wider text-text-muted border-b border-border/50 pb-1 mb-0.5">
            Route Legend
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-warning border border-white" />
            <span>Pending Stop</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-success border border-white" />
            <span>Completed Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-danger border border-white" />
            <span>Failed Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary border-2 border-white text-white">
              <Truck size={10} />
            </div>
            <span>Current Location (Draggable)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
