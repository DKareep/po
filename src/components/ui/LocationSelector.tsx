import { useEffect, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin, Search, Loader2 } from 'lucide-react'

// Set Mapbox token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''
mapboxgl.accessToken = MAPBOX_TOKEN

interface Suggestion {
  id: string
  place_name: string
  center: [number, number]
}

export function LocationSelector() {
  const { setValue, watch } = useFormContext()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)

  const lat = watch('lat')
  const lng = watch('lng')

  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return
    if (mapRef.current) return

    // Set initial coordinates: either existing lat/lng or default to JFK area
    const initialLng = lng && !isNaN(Number(lng)) ? Number(lng) : -73.7781
    const initialLat = lat && !isNaN(Number(lat)) ? Number(lat) : 40.6413

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [initialLng, initialLat],
      zoom: lng && lat ? 13 : 9,
    })

    mapRef.current = map

    // Add navigation controls
    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      'bottom-right',
    )

    // Create marker
    const marker = new mapboxgl.Marker({
      draggable: true,
      color: '#3b82f6', // sleek blue color
    })
      .setLngLat([initialLng, initialLat])
      .addTo(map)

    markerRef.current = marker

    // Update form when marker drag ends
    marker.on('dragend', () => {
      const lngLat = marker.getLngLat()
      updateLocation(lngLat.lat, lngLat.lng, true)
    })

    // Update location when map is clicked
    map.on('click', (e) => {
      marker.setLngLat(e.lngLat)
      updateLocation(e.lngLat.lat, e.lngLat.lng, true)
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync marker and center if external value changes (only if map exists and values are valid numbers)
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return
    if (lat === undefined || lng === undefined) return

    const markerLngLat = markerRef.current.getLngLat()
    const diffLat = Math.abs(markerLngLat.lat - Number(lat))
    const diffLng = Math.abs(markerLngLat.lng - Number(lng))

    // Prevent infinite loop if differences are extremely tiny
    if (diffLat > 0.0001 || diffLng > 0.0001) {
      markerRef.current.setLngLat([Number(lng), Number(lat)])
      mapRef.current.flyTo({ center: [Number(lng), Number(lat)], zoom: 14 })
    }
  }, [lat, lng])

  // Handle outside click to close suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Reverse Geocoding to get Address
  async function reverseGeocode(latitude: number, longitude: number) {
    if (!MAPBOX_TOKEN) return
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&limit=1`,
      )
      const data = await response.json()
      if (data.features && data.features.length > 0) {
        const placeName = data.features[0].place_name
        setValue('address', placeName, { shouldValidate: true })
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error)
    }
  }

  // Update form fields and optionally trigger geocoding
  function updateLocation(
    latitude: number,
    longitude: number,
    shouldReverseGeocode = false,
  ) {
    setValue('lat', Number(latitude.toFixed(6)), { shouldValidate: true })
    setValue('lng', Number(longitude.toFixed(6)), { shouldValidate: true })

    if (shouldReverseGeocode) {
      reverseGeocode(latitude, longitude)
    }
  }

  // Forward Geocoding (search input)
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    if (!value.trim()) {
      setSuggestions([])
      setShowDropdown(false)
      return
    }

    setIsSearching(true)
    setShowDropdown(true)
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          value,
        )}.json?access_token=${MAPBOX_TOKEN}&limit=5`,
      )
      const data = await response.json()
      if (data.features) {
        setSuggestions(
          data.features.map(
            (feat: {
              id: string
              place_name: string
              center: [number, number]
            }) => ({
              id: feat.id,
              place_name: feat.place_name,
              center: feat.center,
            }),
          ),
        )
      }
    } catch (error) {
      console.error('Error searching geocode:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const selectSuggestion = (s: Suggestion) => {
    const [longitude, latitude] = s.center
    setSearchQuery(s.place_name)
    setSuggestions([])
    setShowDropdown(false)

    setValue('address', s.place_name, { shouldValidate: true })
    updateLocation(latitude, longitude, false)

    if (mapRef.current && markerRef.current) {
      markerRef.current.setLngLat([longitude, latitude])
      mapRef.current.flyTo({
        center: [longitude, latitude],
        zoom: 14,
        essential: true,
      })
    }
  }

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative" ref={dropdownRef}>
        <label className="mb-1.5 block text-xs font-semibold text-text-secondary uppercase tracking-wider">
          Search Location
        </label>
        <div className="relative">
          <input
            type="text"
            className="w-full rounded-md border border-border bg-surface py-2.5 pl-10 pr-10 text-sm text-text placeholder-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
            placeholder="Type address to search location..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery.trim() && setShowDropdown(true)}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted pointer-events-none">
            <Search size={18} />
          </div>
          {isSearching && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted">
              <Loader2 className="animate-spin" size={18} />
            </div>
          )}
        </div>

        {/* Search Suggestions Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-surface py-1 text-sm shadow-lg ring-1 ring-black/5">
            {suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                className="flex w-full items-center px-4 py-2 text-left text-text hover:bg-surface-hover transition-colors"
                onClick={() => selectSuggestion(s)}
              >
                <MapPin size={16} className="mr-2 text-text-muted shrink-0" />
                <span className="truncate">{s.place_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Coordinate Displays */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Latitude
          </label>
          <input
            type="number"
            step="any"
            className="w-full rounded-md border border-border bg-surface-muted py-2.5 px-3.5 text-sm text-text cursor-not-allowed"
            value={lat !== undefined ? lat : ''}
            readOnly
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Longitude
          </label>
          <input
            type="number"
            step="any"
            className="w-full rounded-md border border-border bg-surface-muted py-2.5 px-3.5 text-sm text-text cursor-not-allowed"
            value={lng !== undefined ? lng : ''}
            readOnly
          />
        </div>
      </div>

      {/* Interactive Map */}
      <div className="relative rounded-md border border-border overflow-hidden shadow-inner bg-bg-secondary">
        <div ref={mapContainerRef} className="h-64 w-full" />
        <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur px-3 py-1.5 rounded-md border border-border text-xs font-medium text-text-secondary pointer-events-none select-none flex items-center gap-1.5 shadow-sm">
          <MapPin size={14} className="text-primary" />
          Drag marker or click map to adjust position
        </div>
      </div>
    </div>
  )
}
