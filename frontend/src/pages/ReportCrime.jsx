import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useReports } from '../context/ReportsContext';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Location } from '../components/Location';
import { Evidence } from '../components/Evidence';
import axios from 'axios';
import './ReportCrime.css';

const API_URL = 'http://localhost:5000';

export function ReportCrime() {
  const { user, token } = useAuth();
  const { addReport } = useReports();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [showEvidenceUpload, setShowEvidenceUpload] = useState(false);
  const [evidence, setEvidence] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    crimeType: 'Theft',
    description: '',
    location: '',
    latitude: null,
    longitude: null
  });
  const [locationData, setLocationData] = useState({
    latitude: null,
    longitude: null,
    address: ''
  });

  const crimeTypes = [
    'Theft', 'Robbery', 'Assault', 'Breaking and Entering',
    'Harassment', 'Fraud', 'Vandalism', 'Drug-related',
    'Suspicious Activity', 'Other'
  ];

  const handleEvidenceAdded = (newEvidence) => {
    setEvidence(prev => [...prev, newEvidence]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description) {
      setError('Title and description are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Create report via API
      const response = await axios.post(
        `${API_URL}/api/reports`,
        {
          title: form.title,
          description: form.description,
          crimeType: form.crimeType,
          location: locationData.address || form.location || 'Not specified',
          latitude: locationData.latitude,
          longitude: locationData.longitude
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newReportId = response.data.id;
      setReportId(newReportId);
      setSubmitted(true);
      setShowEvidenceUpload(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="report-container">
        <div className="success-message">
          <CheckCircle size={60} />
          <h2>Report Submitted Successfully!</h2>
          <p>Thank you for helping keep our community safe.</p>
          
          {showEvidenceUpload && (
            <div className="evidence-section">
              <p className="evidence-instruction">📸 Optional: Upload photos or videos as evidence to support your report</p>
              <Evidence reportId={reportId} evidence={evidence} onEvidenceAdded={handleEvidenceAdded} readOnly={false} />
              <div className="evidence-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/my-reports')}
                >
                  Go to My Reports
                </button>
              </div>
            </div>
          )}
          
          {!showEvidenceUpload && (
            <p className="redirect-message">Redirecting to your reports...</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="report-container">
      <div className="report-header">
        <AlertCircle size={40} />
        <h1>Report a Crime</h1>
        <p>Provide detailed information to help law enforcement</p>
      </div>

      <form onSubmit={handleSubmit} className="report-form">
        <div className="form-section">
          <h2>Crime Information</h2>

          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="title">
              Incident Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Brief title of the incident"
              value={form.title}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="crimeType">
              Crime Type <span className="required">*</span>
            </label>
            <select
              id="crimeType"
              name="crimeType"
              value={form.crimeType}
              onChange={handleChange}
              disabled={loading}
            >
              {crimeTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              Location <span className="optional-hint">(Optional)</span>
            </label>
            <Location onLocationSelected={setLocationData} />
            {locationData.latitude && locationData.longitude && (
              <div className="location-status">
                ✓ Location set: {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
              </div>
            )}
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">
              Detailed Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Please provide as much detail as possible about what happened, when it happened, and any other relevant information"
              value={form.description}
              onChange={handleChange}
              rows="8"
              required
              disabled={loading}
            />
            <p className="character-count">
              {form.description.length} characters
            </p>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>

      <div className="safety-tips">
        <h3>⚠️ Important Information</h3>
        <ul>
          <li>Provide accurate and detailed information for faster investigation</li>
          <li>Include names, descriptions, and any identifying information</li>
          <li>If this is an emergency, call 911 immediately</li>
          <li>Your report will be kept confidential</li>
        </ul>
      </div>
    </div>
  );
}
