import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, AlertCircle, Eye } from 'lucide-react';
import './Dashboard.css';

export function CitizenDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const dashboard_items = [
    {
      id: 1,
      title: 'Report Crime',
      description: 'File a new crime report with detailed information',
      icon: AlertCircle,
      action: '/report-crime',
      color: 'red'
    },
    {
      id: 2,
      title: 'View My Reports',
      description: 'Check the status of all your submitted reports',
      icon: FileText,
      action: '/my-reports',
      color: 'blue'
    },
    {
      id: 3,
      title: 'View Insights',
      description: 'See reported crimes on an interactive map',
      icon: Eye,
      action: '/insights',
      color: 'orange'
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name}! 👋</h1>
        <p>Your Citizen Dashboard</p>
      </div>

      <div className="dashboard-cards">
        {dashboard_items.map((item) => {
          const IconComponent = item.icon;
          return (
            <div key={item.id} className={`dashboard-card ${item.color}`}>
              <div className="card-icon">
                <IconComponent size={40} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <button
                className="btn btn-primary"
                onClick={() => navigate(item.action)}
              >
                Go →
              </button>
            </div>
          );
        })}
      </div>

      <section className="dashboard-section">
        <h2>Quick Stats</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">0</div>
            <div className="stat-label">Your Reports</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">0</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">0</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>
      </section>

      <section className="dashboard-section">
        <h2>Safety Tips</h2>
        <div className="tips-container">
          <div className="tip-card">
            <h3>🚨 Emergency?</h3>
            <p>In case of emergency, contact local police immediately at 911</p>
          </div>
          <div className="tip-card">
            <h3>📱 Be Detailed</h3>
            <p>Provide as much detail as possible in your reports for better investigation</p>
          </div>
          <div className="tip-card">
            <h3>🔒 Stay Safe</h3>
            <p>Your reports are secure and confidential. Your safety is our priority.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
