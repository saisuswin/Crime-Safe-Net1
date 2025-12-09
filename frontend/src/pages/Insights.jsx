import React, { useState } from 'react';
import { useReports } from '../context/ReportsContext';
import { Map, AlertCircle, TrendingUp } from 'lucide-react';
import './Insights.css';

export function Insights() {
  const { reports } = useReports();
  const [selectedCrimeType, setSelectedCrimeType] = useState('all');

  const crimeTypes = ['all', ...new Set(reports.map(r => r.crimeType))];
  
  const filteredReports = selectedCrimeType === 'all'
    ? reports
    : reports.filter(r => r.crimeType === selectedCrimeType);

  const getCrimeStats = () => {
    const stats = {};
    reports.forEach(r => {
      stats[r.crimeType] = (stats[r.crimeType] || 0) + 1;
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  };

  const getLocationStats = () => {
    const stats = {};
    reports.forEach(r => {
      stats[r.location] = (stats[r.location] || 0) + 1;
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]).slice(0, 5);
  };

  return (
    <div className="insights-container">
      <div className="insights-header">
        <TrendingUp size={40} />
        <h1>Crime Insights & Analytics</h1>
        <p>View reported crimes on an interactive map and detailed statistics</p>
      </div>

      <div className="insights-grid">
        <div className="map-section">
          <h2>📍 Crime Locations Map</h2>
          <div className="map-placeholder">
            <div className="placeholder-content">
              <Map size={60} />
              <h3>OpenStreetMap Integration</h3>
              <p>Crime reports are displayed on an interactive map below</p>
            </div>
            <iframe
              width="100%"
              height="500"
              frameBorder="0"
              style={{ borderRadius: '8px', marginTop: '1rem' }}
              src="https://www.openstreetmap.org/export/embed.html?bbox=-74.0059,40.7128,-73.9355,40.7580&layer=mapnik"
              title="Crime Map"
            ></iframe>
          </div>

          <div className="filter-section">
            <label>Filter by Crime Type:</label>
            <select 
              value={selectedCrimeType}
              onChange={(e) => setSelectedCrimeType(e.target.value)}
              className="crime-filter"
            >
              {crimeTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Crimes' : type}
                </option>
              ))}
            </select>
          </div>

          <div className="incidents-list">
            <h3>🚨 Incidents in Selected Area</h3>
            {filteredReports.length === 0 ? (
              <p className="no-data">No incidents found</p>
            ) : (
              <div className="incidents-table">
                {filteredReports.map(report => (
                  <div key={report.id} className="incident-row">
                    <div className="incident-info">
                      <div className="incident-title">{report.title}</div>
                      <div className="incident-location">📍 {report.location}</div>
                    </div>
                    <div className="incident-type">{report.crimeType}</div>
                    <div className={`incident-status ${report.status.replace(/\s+/g, '-').toLowerCase()}`}>
                      {report.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="stats-section">
          <div className="stats-card">
            <h2>📊 Crime Statistics</h2>
            <div className="stat-category">
              <h3>By Type</h3>
              <div className="stat-list">
                {getCrimeStats().map(([type, count]) => (
                  <div key={type} className="stat-item">
                    <div className="stat-name">{type}</div>
                    <div className="stat-bar">
                      <div 
                        className="stat-fill" 
                        style={{ width: `${(count / reports.length) * 100}%` }}
                      ></div>
                    </div>
                    <div className="stat-count">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="stats-card">
            <h3>Top Crime Locations</h3>
            <div className="location-list">
              {getLocationStats().map(([location, count], idx) => (
                <div key={location} className="location-item">
                  <span className="location-rank">#{idx + 1}</span>
                  <span className="location-name">{location}</span>
                  <span className="location-count">{count} reports</span>
                </div>
              ))}
            </div>
          </div>

          <div className="overview-cards">
            <div className="overview-card">
              <div className="overview-number">{reports.length}</div>
              <div className="overview-label">Total Reports</div>
            </div>
            <div className="overview-card">
              <div className="overview-number">{new Set(reports.map(r => r.crimeType)).size}</div>
              <div className="overview-label">Crime Types</div>
            </div>
            <div className="overview-card">
              <div className="overview-number">{new Set(reports.map(r => r.location)).size}</div>
              <div className="overview-label">Locations</div>
            </div>
          </div>
        </div>
      </div>

      <section className="insights-info">
        <h2>About This Map</h2>
        <div className="info-content">
          <p>
            This interactive map shows the locations of all reported crimes in our community. 
            Each marker represents a crime report that has been submitted by citizens. The data 
            is updated in real-time and helps law enforcement agencies identify crime patterns 
            and allocate resources more effectively.
          </p>
          <div className="map-legend">
            <h3>Legend</h3>
            <div className="legend-item">
              <span className="legend-status reported">●</span>
              <span>Reported - Awaiting Review</span>
            </div>
            <div className="legend-item">
              <span className="legend-status investigating">●</span>
              <span>Under Investigation</span>
            </div>
            <div className="legend-item">
              <span className="legend-status resolved">●</span>
              <span>Resolved</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
