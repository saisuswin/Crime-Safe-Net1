import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Clock, AlertCircle, Filter, Activity } from 'lucide-react';
import axios from 'axios';
import './PoliceDashboard.css';

const API_URL = 'http://localhost:5000';

export function PoliceDashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [activities, setActivities] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
    // Poll for updates every 10 seconds
    const interval = setInterval(loadDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [reportsRes, activitiesRes] = await Promise.all([
        axios.get(`${API_URL}/api/reports`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/activity`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setReports(reportsRes.data || []);
      setActivities(activitiesRes.data || []);
      setError('');
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = filterStatus === 'all' 
    ? reports 
    : reports.filter(r => r.status === filterStatus);

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'resolved':
      case 'closed':
        return <CheckCircle size={16} />;
      case 'under investigation':
      case 'in progress':
        return <Clock size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'open';
    const lowerStatus = status.toLowerCase().replace(/\s+/g, '-');
    if (lowerStatus.includes('resolved') || lowerStatus.includes('closed')) return 'resolved';
    if (lowerStatus.includes('investigation') || lowerStatus.includes('progress')) return 'investigating';
    return 'open';
  };

  return (
    <div className="police-dashboard">
      <div className="dashboard-header">
        <h1>Police Department Dashboard 🚔</h1>
        <p>Manage and track all crime reports in real-time</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-state">Loading dashboard...</div>
      ) : (
        <>
          <div className="dashboard-controls">
            <div className="filter-section">
              <Filter size={20} />
              <span>Filter by Status:</span>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Reports</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div className="report-count">
              Total Reports: <strong>{filteredReports.length}</strong>
            </div>
          </div>

          <div className="dashboard-main-grid">
            {/* Reports Table */}
            <div className="reports-section">
              <h2>Recent Reports</h2>
              <div className="table-container">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Crime Type</th>
                      <th>Location</th>
                      <th>Reported By</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="no-data">No reports found</td>
                      </tr>
                    ) : (
                      filteredReports.slice(0, 20).map((report) => (
                        <tr key={report.id}>
                          <td>#{report.id}</td>
                          <td className="title-cell">{report.title}</td>
                          <td>{report.crime_type}</td>
                          <td>{report.location}</td>
                          <td>{report.citizen_name}</td>
                          <td>{new Date(report.created_at).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-badge ${getStatusColor(report.status)}`}>
                              {getStatusIcon(report.status)}
                              {report.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn-action view"
                              onClick={() => navigate(`/report/${report.id}`)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="activity-feed-section">
              <h2>
                <Activity size={20} /> Recent Activity
              </h2>
              <div className="activity-feed-list">
                {activities.length === 0 ? (
                  <div className="no-activity">No recent activity</div>
                ) : (
                  activities.slice(0, 10).map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-time">
                        {new Date(activity.created_at).toLocaleTimeString()}
                      </div>
                      <div className="activity-content">
                        <strong>{activity.user_name}</strong>
                        <p>{activity.action.replace(/_/g, ' ')}</p>
                        {activity.description && (
                          <small>{activity.description.substring(0, 60)}...</small>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="dashboard-stats">
            <h2>Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <AlertCircle size={32} />
                <div className="stat-number">
                  {reports.filter(r => r.status === 'Open').length}
                </div>
                <div className="stat-label">Open Reports</div>
              </div>
              <div className="stat-card">
                <Clock size={32} />
                <div className="stat-number">
                  {reports.filter(r => r.status?.includes('Investigation') || r.status?.includes('Progress')).length}
                </div>
                <div className="stat-label">Under Investigation</div>
              </div>
              <div className="stat-card">
                <CheckCircle size={32} />
                <div className="stat-number">
                  {reports.filter(r => r.status === 'Resolved' || r.status === 'Closed').length}
                </div>
                <div className="stat-label">Resolved Cases</div>
              </div>
              <div className="stat-card">
                <Activity size={32} />
                <div className="stat-number">
                  {reports.length}
                </div>
                <div className="stat-label">Total Reports</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
