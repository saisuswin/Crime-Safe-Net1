import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, ArrowRight } from 'lucide-react';
import axios from 'axios';
import './MyReports.css';

const API_URL = 'http://localhost:5000';

export function MyReports() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMyReports();
  }, []);

  const loadMyReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/reports/citizen/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMyReports(response.data || []);
      setError('');
    } catch (err) {
      console.error('Error loading reports:', err);
      setError('Failed to load your reports');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'reported';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('resolved') || lowerStatus.includes('closed')) return 'resolved';
    if (lowerStatus.includes('investigation') || lowerStatus.includes('progress')) return 'investigating';
    return 'reported';
  };

  return (
    <div className="my-reports-container">
      <div className="reports-header">
        <FileText size={40} />
        <h1>My Crime Reports</h1>
        <p>Track all your submitted reports in real-time</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading your reports...</div>
      ) : myReports.length === 0 ? (
        <div className="no-reports-message">
          <FileText size={60} />
          <h2>No Reports Yet</h2>
          <p>You haven't submitted any crime reports yet.</p>
          <button 
            onClick={() => navigate('/report-crime')}
            className="btn btn-primary"
          >
            Submit Your First Report
          </button>
        </div>
      ) : (
        <>
          <div className="reports-summary">
            <div className="summary-card">
              <div className="summary-number">{myReports.length}</div>
              <div className="summary-label">Total Reports</div>
            </div>
            <div className="summary-card">
              <div className="summary-number">
                {myReports.filter(r => r.status === 'Open').length}
              </div>
              <div className="summary-label">Open</div>
            </div>
            <div className="summary-card">
              <div className="summary-number">
                {myReports.filter(r => r.status?.includes('Investigation') || r.status?.includes('Progress')).length}
              </div>
              <div className="summary-label">Under Investigation</div>
            </div>
            <div className="summary-card">
              <div className="summary-number">
                {myReports.filter(r => r.status === 'Resolved' || r.status === 'Closed').length}
              </div>
              <div className="summary-label">Resolved</div>
            </div>
          </div>

          <div className="reports-list">
            {myReports.map((report) => (
              <div key={report.id} className="report-item">
                <div className="report-item-header">
                  <div className="report-title-section">
                    <h3>{report.title}</h3>
                    <span className={`status-badge ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                  <div className="report-date">{new Date(report.created_at).toLocaleDateString()}</div>
                </div>

                <div className="report-details">
                  <div className="detail-item">
                    <span className="detail-label">Crime Type:</span>
                    <span className="detail-value">{report.crime_type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{report.location}</span>
                  </div>
                  {report.officer_name && (
                    <div className="detail-item">
                      <span className="detail-label">Assigned Officer:</span>
                      <span className="detail-value">{report.officer_name}</span>
                    </div>
                  )}
                </div>

                <div className="report-description">
                  <h4>Description</h4>
                  <p>{report.description.substring(0, 200)}...</p>
                </div>

                <div className="report-footer">
                  <span className="report-id">Report ID: #{report.id}</span>
                  <button 
                    className="btn-view-details"
                    onClick={() => navigate(`/report/${report.id}`)}
                  >
                    View Details <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
