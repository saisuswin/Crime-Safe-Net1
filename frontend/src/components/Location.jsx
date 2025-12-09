import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, X, Map as MapIcon } from 'lucide-react';
import './Location.css';

export function Location({ onLocationSelected, initialLocation = null, readOnly = false }) {
  const [location, setLocation] = useState(initialLocation || { address: '', latitude: null, longitude: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // India center
  const mapContainerRef = useRef(null);
  const scriptLoadedRef = useRef(false);

  // Load Leaflet library
  useEffect(() => {
    if (!scriptLoadedRef.current && showMapPicker) {
      scriptLoadedRef.current = true;
      loadLeafletScript();
    }
  }, [showMapPicker]);

  useEffect(() => {
    if (location.latitude && location.longitude) {
      setMapUrl(`https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude - 0.015},${location.latitude - 0.015},${location.longitude + 0.015},${location.latitude + 0.015}&layer=mapnik&marker=${location.latitude},${location.longitude}`);
    }
  }, [location.latitude, location.longitude]);

  useEffect(() => {
    if (onLocationSelected) {
      onLocationSelected(location);
    }
  }, [location]);

  const loadLeafletScript = () => {
    // Load Leaflet CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
    document.head.appendChild(cssLink);

    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
    script.async = true;
    script.onload = initializeMap;
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapContainerRef.current) return;

    // Clear previous map if exists
    mapContainerRef.current.innerHTML = '';

    // Create map container
    const mapDiv = document.createElement('div');
    mapDiv.id = 'crime-map-picker';
    mapDiv.style.width = '100%';
    mapDiv.style.height = '400px';
    mapContainerRef.current.appendChild(mapDiv);

    // Initialize map
    const map = window.L.map('crime-map-picker').setView([mapCenter.lat, mapCenter.lng], 13);

    // Add OpenStreetMap tiles
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add marker that follows cursor
    let marker = null;
    const updateMarker = (lat, lng) => {
      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = window.L.marker([lat, lng], {
          icon: window.L.icon({
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            shadowSize: [41, 41],
          })
        }).addTo(map).bindPopup('Crime Location');
      }
    };

    // Add click listener to map
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      updateMarker(lat, lng);
      setLocation(prev => ({
        ...prev,
        latitude: parseFloat(lat.toFixed(6)),
        longitude: parseFloat(lng.toFixed(6))
      }));
      setMapCenter({ lat, lng });
    });

    // Add move listener for current position indicator
    map.on('mousemove', (e) => {
      if (mapContainerRef.current) {
        const coords = mapContainerRef.current.querySelector('.map-coords-indicator');
        if (coords) {
          coords.textContent = `Cursor: ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`;
        }
      }
    });

    // If location already selected, show marker
    if (location.latitude && location.longitude) {
      updateMarker(location.latitude, location.longitude);
      map.setView([location.latitude, location.longitude], 13);
    }
  };

  const getCurrentLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(prev => ({
          ...prev,
          latitude,
          longitude
        }));
        setMapCenter({ lat: latitude, lng: longitude });
        setShowMapPicker(false);
        setError('');
        setLoading(false);
      },
      (error) => {
        setError(`Location error: ${error.message}`);
        setLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleAddressChange = (e) => {
    setLocation(prev => ({ ...prev, address: e.target.value }));
  };

  const clearLocation = () => {
    setLocation({ address: '', latitude: null, longitude: null });
    setShowMapPicker(false);
  };

  return (
    <div className="location-section">
      <h3>📍 Crime Location <span className="optional-label">(Optional)</span></h3>

      <div className="location-inputs">
        <div className="form-group">
          <label>Address or Landmark Description (Optional)</label>
          <input
            type="text"
            placeholder="e.g., 123 Main Street, Downtown Market..."
            value={location.address}
            onChange={handleAddressChange}
            disabled={readOnly}
          />
        </div>

        {!readOnly && (
          <div className="location-buttons">
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={loading}
              className="btn-geolocation"
              title="Use device GPS to get your current location"
            >
              <Navigation size={18} />
              {loading ? 'Getting location...' : 'Current Location'}
            </button>

            <button
              type="button"
              onClick={() => setShowMapPicker(!showMapPicker)}
              className="btn-map-picker"
              title="Click on map to select exact crime location"
            >
              <MapIcon size={18} />
              {showMapPicker ? 'Close Map' : 'Select on Map'}
            </button>

            {location.latitude && location.longitude && (
              <button
                type="button"
                onClick={clearLocation}
                className="btn-clear-location"
                title="Clear selected location"
              >
                <X size={18} />
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showMapPicker && !location.latitude && (
        <div className="map-picker-section">
          <div className="map-picker-info">
            <p className="info-text">🗺️ Click on the map to mark the exact crime location. You can zoom and drag to navigate.</p>
            <p className="map-coords-indicator">Click to select...</p>
          </div>
          <div ref={mapContainerRef} className="map-picker-container" />
        </div>
      )}

      {location.latitude && location.longitude && (
        <div className="location-display">
          <div className="location-badge">
            <MapPin size={16} />
            <span>Location Selected ✓</span>
          </div>

          <div className="coordinates">
            <div className="coord-item">
              <strong>Latitude:</strong>
              <span className="coord-value">{location.latitude.toFixed(6)}</span>
            </div>
            <div className="coord-item">
              <strong>Longitude:</strong>
              <span className="coord-value">{location.longitude.toFixed(6)}</span>
            </div>
          </div>

          {mapUrl && (
            <div className="map-container">
              <iframe
                width="100%"
                height="350"
                frameBorder="0"
                src={mapUrl}
                style={{ borderRadius: '8px' }}
                title="Crime Location Map"
              ></iframe>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
