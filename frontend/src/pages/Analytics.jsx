import React, { useState, useEffect } from 'react';
import { BarChart3, MapPin, TrendingUp, Clock, CheckCircle, AlertCircle, ZoomIn, Globe } from 'lucide-react';
import axios from 'axios';
import './Analytics.css';

const API_URL = 'http://localhost:5000';

export function Analytics() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapInitialized, setMapInitialized] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [filteredReports, setFilteredReports] = useState([]);
  const [mapInstance, setMapInstance] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    if (reports.length > 0 && !mapInitialized) {
      initializeMap();
    }
  }, [reports, mapInitialized]);

  useEffect(() => {
    if (selectedLocation) {
      filterIncidentsByLocation();
    } else {
      setFilteredReports([]);
    }
  }, [selectedLocation, reports]);

  const loadReports = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/reports`);
      setReports(response.data || []);
      setError('');
    } catch (err) {
      console.error('Error loading reports:', err);
      setError('Failed to load crime data');
    } finally {
      setLoading(false);
    }
  };

  const loadLeafletScript = () => {
    return new Promise((resolve) => {
      if (window.L) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });
  };

  const getMarkerColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return '#4CAF50'; // Green
      case 'under investigation':
        return '#FF9800'; // Orange
      case 'reported':
      default:
        return '#f44336'; // Red
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return <CheckCircle size={16} />;
      case 'under investigation':
        return <Clock size={16} />;
      case 'reported':
      default:
        return <AlertCircle size={16} />;
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filterIncidentsByLocation = () => {
    if (!selectedLocation) {
      setFilteredReports([]);
      return;
    }

    const radiusKm = 50; // Search radius in km
    const nearby = reports.filter(report => {
      if (!report.latitude || !report.longitude) return false;
      const distance = calculateDistance(
        selectedLocation.lat,
        selectedLocation.lng,
        report.latitude,
        report.longitude
      );
      return distance <= radiusKm;
    });

    setFilteredReports(nearby.sort((a, b) => 
      calculateDistance(selectedLocation.lat, selectedLocation.lng, a.latitude, a.longitude) -
      calculateDistance(selectedLocation.lat, selectedLocation.lng, b.latitude, b.longitude)
    ));
  };

  const initializeMap = async () => {
    await loadLeafletScript();

    // Clear existing map
    const mapContainer = document.getElementById('crime-map');
    if (mapContainer._leaflet_id) {
      mapContainer._leaflet_id = null;
    }

    // Create map centered on world
    const map = window.L.map('crime-map').setView([20, 0], 2);
    setMapInstance(map);
    
    // Add tile layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Add markers for each report with coordinates
    const markerGroup = window.L.featureGroup().addTo(map);

    reports.forEach(report => {
      if (report.latitude && report.longitude) {
        const color = getMarkerColor(report.status);
        
        // Create custom icon
        const markerHtml = `
          <div style="
            background-color: ${color};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.2s;
          ">
            <div style="
              width: 8px;
              height: 8px;
              background-color: white;
              border-radius: 50%;
            "></div>
          </div>
        `;

        const icon = window.L.divIcon({
          html: markerHtml,
          iconSize: [28, 28],
          className: 'custom-pin'
        });

        const marker = window.L.marker([report.latitude, report.longitude], { icon })
          .bindPopup(`
            <div class="crime-popup">
              <strong>${report.title}</strong><br/>
              <small>Type: ${report.crime_type}</small><br/>
              <small>Status: <span style="color: ${color}; font-weight: bold;">${report.status}</span></small><br/>
              <small>Location: ${report.location}</small><br/>
              <small>Reported by: ${report.citizen_name}</small>
            </div>
          `)
          .on('click', () => {
            setSelectedLocation({ lat: report.latitude, lng: report.longitude });
            map.setView([report.latitude, report.longitude], 10);
          })
          .addTo(markerGroup);
      }
    });

    // Add click handler for map to select location
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      setSelectedLocation({ lat, lng });
      map.setView([lat, lng], 10);
      
      // Add temporary marker at clicked location
      if (window.selectedLocationMarker) {
        map.removeLayer(window.selectedLocationMarker);
      }
      window.selectedLocationMarker = window.L.circleMarker([lat, lng], {
        radius: 15,
        fillColor: '#2196F3',
        color: '#1976D2',
        weight: 3,
        opacity: 0.8,
        fillOpacity: 0.3
      }).addTo(map);
    });

    setMapInitialized(true);
  };

  const resetZoom = () => {
    if (mapInstance) {
      setSelectedLocation(null);
      mapInstance.setView([20, 0], 2);
      if (window.selectedLocationMarker) {
        mapInstance.removeLayer(window.selectedLocationMarker);
      }
    }
  };

  const getStatistics = () => {
    const reportsToCount = selectedLocation ? filteredReports : reports;
    const stats = {
      total: reportsToCount.length,
      reported: reportsToCount.filter(r => r.status?.toLowerCase() === 'reported').length,
      investigating: reportsToCount.filter(r => r.status?.toLowerCase() === 'under investigation').length,
      resolved: reportsToCount.filter(r => r.status?.toLowerCase() === 'resolved').length
    };
    return stats;
  };

  const getTopCrimes = () => {
    const reportsToCount = selectedLocation ? filteredReports : reports;
    const crimeCount = {};
    reportsToCount.forEach(report => {
      crimeCount[report.crime_type] = (crimeCount[report.crime_type] || 0) + 1;
    });
    return Object.entries(crimeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const stats = getStatistics();
  const topCrimes = getTopCrimes();

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>📊 Global Crime Analytics</h1>
        <p>Click on the map to explore crimes in a specific area</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <MapPin size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Incidents {selectedLocation ? '(Selected Area)' : '(Worldwide)'}</div>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>

        <div className="stat-card reported">
          <div className="stat-icon">
            <AlertCircle size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Reported</div>
            <div className="stat-value">{stats.reported}</div>
          </div>
        </div>

        <div className="stat-card investigating">
          <div className="stat-icon">
            <Clock size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Under Investigation</div>
            <div className="stat-value">{stats.investigating}</div>
          </div>
        </div>

        <div className="stat-card resolved">
          <div className="stat-icon">
            <CheckCircle size={32} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Resolved</div>
            <div className="stat-value">{stats.resolved}</div>
          </div>
        </div>
      </div>

      {/* World Map */}
      <div className="map-section">
        <div className="map-header">
          <div>
            <h2>🌍 Global Crime Map</h2>
            <p className="map-instructions">
              {selectedLocation 
                ? `✅ Selected location: ${selectedLocation.lat.toFixed(2)}°, ${selectedLocation.lng.toFixed(2)}° • ${filteredReports.length} incident${filteredReports.length !== 1 ? 's' : ''} nearby`
                : '👆 Click on a location to zoom in and see nearby incidents'
              }
            </p>
          </div>
          {selectedLocation && (
            <button onClick={resetZoom} className="btn btn-secondary">
              <Globe size={18} /> View Worldwide
            </button>
          )}
        </div>
        <div className="map-legend">
          <div className="legend-item">
            <div className="legend-pin" style={{ backgroundColor: '#f44336' }}></div>
            <span>Reported</span>
          </div>
          <div className="legend-item">
            <div className="legend-pin" style={{ backgroundColor: '#FF9800' }}></div>
            <span>Under Investigation</span>
          </div>
          <div className="legend-item">
            <div className="legend-pin" style={{ backgroundColor: '#4CAF50' }}></div>
            <span>Resolved</span>
          </div>
          <div className="legend-item">
            <div className="legend-circle"></div>
            <span>Selected Location</span>
          </div>
        </div>
        <div id="crime-map" className="crime-map"></div>
      </div>

      {/* Top Crimes */}
      <div className="insights-section">
        <h2>🔍 Top Crime Types {selectedLocation && '(Selected Area)'}</h2>
        <div className="crimes-list">
          {topCrimes.length > 0 ? (
            topCrimes.map(([crimeType, count], index) => (
              <div key={index} className="crime-item">
                <div className="crime-rank">{index + 1}</div>
                <div className="crime-info">
                  <div className="crime-name">{crimeType}</div>
                  <div className="crime-count">{count} incident{count !== 1 ? 's' : ''}</div>
                </div>
                <div className="crime-bar">
                  <div 
                    className="crime-bar-fill" 
                    style={{ width: `${(count / (topCrimes[0][1] || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">No crime data available{selectedLocation ? ' in this area' : ''}</p>
          )}
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="recent-section">
        <h2>📋 {selectedLocation ? 'Nearby Incidents (50km radius)' : 'Recent Incidents Worldwide'}</h2>
        <div className="incidents-list">
          {(selectedLocation ? filteredReports : reports).slice(0, 15).length > 0 ? (
            (selectedLocation ? filteredReports : reports).slice(0, 15).map(report => (
              <div key={report.id} className="incident-item">
                <div className="incident-status" style={{ color: getMarkerColor(report.status) }}>
                  {getStatusIcon(report.status)}
                </div>
                <div className="incident-info">
                  <div className="incident-title">{report.title}</div>
                  <div className="incident-details">
                    <span>{report.crime_type}</span>
                    <span>•</span>
                    <span>{report.location}</span>
                    {selectedLocation && report.latitude && report.longitude && (
                      <>
                        <span>•</span>
                        <span>{calculateDistance(selectedLocation.lat, selectedLocation.lng, report.latitude, report.longitude).toFixed(1)}km away</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="incident-status-badge" style={{ color: getMarkerColor(report.status) }}>
                  {report.status}
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">No incidents reported{selectedLocation ? ' in this area' : ''}</p>
          )}
        </div>
      </div>
    </div>
  );
}
