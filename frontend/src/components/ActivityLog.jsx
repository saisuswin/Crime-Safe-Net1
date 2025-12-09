import React, { useState, useEffect } from 'react';
import { Activity, MessageSquare } from 'lucide-react';
import axios from 'axios';
import './ActivityLog.css';

const API_URL = 'http://localhost:5000';

export function ActivityLog({ reportId }) {
  const [activities, setActivities] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadActivityLog();
  }, [reportId]);

  const loadActivityLog = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const [activitiesRes, updatesRes] = await Promise.all([
        axios.get(`${API_URL}/api/activity/${reportId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);

      setActivities(activitiesRes.data || []);
      setError('');
    } catch (err) {
      console.error('Error loading activity:', err);
      setError('Failed to load activity log');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/reports/${reportId}/update`,
        { comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUpdates(prev => [response.data, ...prev]);
      setNewComment('');
      loadActivityLog();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add comment');
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'COMMENT_ADDED':
        return '💬';
      case 'STATUS_UPDATED':
        return '✏️';
      case 'EVIDENCE_UPLOADED':
        return '📎';
      case 'REPORT_CREATED':
        return '📝';
      default:
        return '📌';
    }
  };

  return (
    <div className="activity-log-section">
      <h3>
        <Activity size={20} /> Activity Timeline
      </h3>

      <div className="comment-box">
        <form onSubmit={handleAddComment}>
          <textarea
            placeholder="Add an update or comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows="3"
          />
          <button type="submit" className="btn btn-primary" disabled={!newComment.trim()}>
            <MessageSquare size={16} /> Post Update
          </button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading activity...</div>
      ) : activities.length === 0 ? (
        <div className="no-activity">No activity yet</div>
      ) : (
        <div className="activity-timeline">
          {activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">{getActionIcon(activity.action)}</div>
              <div className="activity-content">
                <div className="activity-header">
                  <strong>{activity.user_name || 'System'}</strong>
                  <span className="activity-action">{activity.action.replace(/_/g, ' ')}</span>
                </div>
                <p className="activity-description">{activity.description}</p>
                {activity.old_value && activity.new_value && (
                  <div className="activity-change">
                    <span className="old-value">{activity.old_value}</span>
                    <span className="arrow">→</span>
                    <span className="new-value">{activity.new_value}</span>
                  </div>
                )}
                <time>{new Date(activity.created_at).toLocaleString()}</time>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
