import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, MapPin, Clock, FileText } from 'lucide-react';
import { Evidence } from '../components/Evidence';
import { ActivityLog } from '../components/ActivityLog';
import axios from 'axios';
import './ReportDetail.css';

const API_URL = 'http://localhost:5000';

export function ReportDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReport(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load report');
      console.error('Error loading report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    if (!newStatus) return;

    try {
      setStatusLoading(true);
      await axios.patch(
        `${API_URL}/api/reports/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewStatus('');
      loadReport();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="report-detail-container">
        <div className="loading-state">Loading report...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="report-detail-container">
        <div className="error-state">{error || 'Report not found'}</div>
      </div>
    );
  }

  const isOfficer = user?.role === 'police';
  const isCitizen = user?.id === report.citizen_id;

  return (
    <div className="report-detail-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        <ArrowLeft size={20} /> Back
      </button>

      <div className="report-detail-main">
        {/* Report Header */}
        <div className="report-detail-header">
          <div className="status-badge" data-status={report.status?.toLowerCase()}>
            {report.status}
          </div>
          <h1>{report.title}</h1>
          <p className="crime-type">{report.crime_type}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Report Information Grid */}
        <div className="report-info-grid">
          <div className="info-card">
            <label>Reported By</label>
            <p>{report.citizen_name}</p>
          </div>
          <div className="info-card">
            <label>Date & Time</label>
            <p>{new Date(report.created_at).toLocaleString()}</p>
          </div>
          <div className="info-card">
            <label>Assigned Officer</label>
            <p>{report.officer_name || 'Unassigned'}</p>
          </div>
          <div className="info-card">
            <label>Status</label>
            <p className="status-text">{report.status}</p>
          </div>
        </div>

        {/* Location Section */}
        {report.latitude && report.longitude && (
          <div className="location-section">
            <h3>
              <MapPin size={20} /> Crime Location
            </h3>
            <div className="coordinates">
              <span>Latitude: {report.latitude.toFixed(6)}</span>
              <span>Longitude: {report.longitude.toFixed(6)}</span>
            </div>
            {report.location && <p className="address">{report.location}</p>}
            <div className="map-container">
              <iframe
                width="100%"
                height="400"
                frameBorder="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                  report.longitude - 0.01
                },${report.latitude - 0.01},${report.longitude + 0.01},${
                  report.latitude + 0.01
                }&layer=mapnik&marker=${report.latitude},${report.longitude}`}
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              />
            </div>
          </div>
        )}

        {/* Description Section */}
        <div className="description-section">
          <h3>
            <FileText size={20} /> Description
          </h3>
          <p>{report.description}</p>
        </div>

        {/* Evidence Section */}
        <div className="evidence-section">
          <h3>📎 Evidence & Media</h3>
          <Evidence 
            reportId={id} 
            evidence={report.evidence || []} 
            onEvidenceAdded={loadReport}
            readOnly={!isCitizen} 
          />
        </div>

        {/* Status Update Section (Officer Only) */}
        {isOfficer && (
          <div className="status-update-section">
            <h3>Update Status</h3>
            <form onSubmit={handleStatusChange}>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                disabled={statusLoading}
              >
                <option value="">Select new status...</option>
                <option value="Reported">Reported</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Resolved">Resolved</option>
              </select>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!newStatus || statusLoading}
              >
                {statusLoading ? 'Updating...' : 'Update Status'}
              </button>
            </form>
          </div>
        )}

        {/* Activity Log */}
        <ActivityLog reportId={id} />
      </div>
    </div>
  );
}
