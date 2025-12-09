import React, { useState } from 'react';
import { Upload, X, FileIcon, Play } from 'lucide-react';
import axios from 'axios';
import './Evidence.css';

const API_URL = 'http://localhost:5000';

export function Evidence({ reportId, evidence, onEvidenceAdded, readOnly = false }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, MP4, and MOV files are allowed');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setError('');
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated. Please log in again.');
        setUploading(false);
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/evidence/upload/${reportId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (onEvidenceAdded) {
        onEvidenceAdded();
      }
      setSelectedFile(null);
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Upload failed';
      console.error('Upload error:', errorMessage);
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="evidence-section">
      <h3>📸 Evidence & Attachments</h3>

      {!readOnly && (
        <div className="evidence-upload">
          <div className="upload-area">
            <input
              type="file"
              id="evidence-input"
              onChange={handleFileChange}
              accept="image/*,video/*"
              disabled={uploading}
            />
            <label htmlFor="evidence-input" className="upload-label">
              <Upload size={32} />
              <span>
                {selectedFile ? selectedFile.name : 'Click or drag to upload photos/videos'}
              </span>
              <small>Max 50MB - JPG, PNG, MP4, MOV</small>
            </label>
          </div>

          {error && <div className="error-message">{error}</div>}

          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn btn-primary"
            >
              {uploading ? 'Uploading...' : 'Upload Evidence'}
            </button>
          )}
        </div>
      )}

      <div className="evidence-list">
        {evidence && evidence.length > 0 ? (
          evidence.map((item) => (
            <div key={item.id} className="evidence-item">
              {item.file_type === 'image' ? (
                <>
                  <img
                    src={`${API_URL}${item.file_path}`}
                    alt={item.file_name}
                    className="evidence-preview"
                  />
                  <div className="evidence-info">
                    <div className="evidence-name">{item.file_name}</div>
                    <small>{new Date(item.created_at).toLocaleString()}</small>
                  </div>
                </>
              ) : (
                <>
                  <div className="video-placeholder">
                    <Play size={32} />
                  </div>
                  <div className="evidence-info">
                    <div className="evidence-name">
                      <FileIcon size={16} /> {item.file_name}
                    </div>
                    <small>{new Date(item.created_at).toLocaleString()}</small>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <p className="no-evidence">No evidence uploaded yet</p>
        )}
      </div>
    </div>
  );
}
