// Manual mock for the `mapbox-gl` package (jsdom has no WebGL/canvas support).
// Auto-applied by Jest for any `import mapboxgl from 'mapbox-gl'` since this
// file lives in the root `__mocks__` directory.
//
// A click anywhere on the map container simulates a click at this fixed
// coordinate, which is enough for components that let a user click the map
// to drop/move a pin (e.g. the hub location picker).
const MOCK_CLICK_LNGLAT = { lat: 40.7128, lng: -74.006 }

class MockMarker {
  constructor(options = {}) {
    this._lngLat = { lng: 0, lat: 0 }
    this._element = options.element || document.createElement('div')
    this._listeners = {}
  }

  setLngLat(lngLat) {
    this._lngLat = Array.isArray(lngLat)
      ? { lng: lngLat[0], lat: lngLat[1] }
      : lngLat
    return this
  }

  getLngLat() {
    return this._lngLat
  }

  getElement() {
    return this._element
  }

  addTo() {
    return this
  }

  remove() {
    return this
  }

  setPopup() {
    return this
  }

  on(event, cb) {
    this._listeners[event] = this._listeners[event] || []
    this._listeners[event].push(cb)
    return this
  }
}

class MockPopup {
  setHTML() {
    return this
  }

  setLngLat() {
    return this
  }

  addTo() {
    return this
  }

  remove() {
    return this
  }
}

class MockNavigationControl {}

class MockMap {
  constructor(options = {}) {
    this._options = options
    this._listeners = {}
    this._container = options.container

    if (this._container) {
      this._onContainerClick = () => {
        this._emit('click', { lngLat: MOCK_CLICK_LNGLAT })
      }
      this._container.addEventListener('click', this._onContainerClick)
    }

    // Real mapbox-gl fires 'load' asynchronously once map tiles/style are
    // ready; components gate marker rendering on it, so we emit it too.
    setTimeout(() => this._emit('load'), 0)
  }

  _emit(event, payload) {
    ;(this._listeners[event] || []).forEach((cb) => cb(payload))
  }

  on(event, cb) {
    this._listeners[event] = this._listeners[event] || []
    this._listeners[event].push(cb)
    return this
  }

  addControl() {
    return this
  }

  remove() {
    if (this._container && this._onContainerClick) {
      this._container.removeEventListener('click', this._onContainerClick)
    }
  }

  flyTo() {}
  setCenter() {}
  resize() {}
  getLayer() {
    return undefined
  }
  removeLayer() {}
  getSource() {
    return undefined
  }
  removeSource() {}
  addSource() {}
  addLayer() {}
}

const mapboxgl = {
  Map: MockMap,
  Marker: MockMarker,
  Popup: MockPopup,
  NavigationControl: MockNavigationControl,
  accessToken: '',
}

module.exports = mapboxgl
