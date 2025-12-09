import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, MapPin, FileText, BarChart3, Lock, Zap, CheckCircle, Users } from 'lucide-react';
import './Home.css';

export function Home() {
  return (
    <div className="home">
      {/* Logo Section */}
      <div className="logo-section">
        <div className="logo-container">
          <div className="logo-icon">
            <Shield size={40} strokeWidth={1.5} />
          </div>
          <h1 className="logo-text">CrimeSafeNet</h1>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-wrapper">
          <div className="hero-content">
            <div className="hero-badge">🔒 Secure Crime Reporting Platform</div>
            <h1>Keep Your Community <span>Safe</span></h1>
            <p className="hero-description">
              CrimeSafeNet is the modern platform connecting citizens and law enforcement to create safer neighborhoods through transparent crime reporting, location tracking, and real-time response.
            </p>
            <div className="hero-highlights">
              <div className="highlight">
                <CheckCircle size={20} />
                <span>Real-time crime reporting</span>
              </div>
              <div className="highlight">
                <CheckCircle size={20} />
                <span>Location-based tracking</span>
              </div>
              <div className="highlight">
                <CheckCircle size={20} />
                <span>Evidence upload capability</span>
              </div>
            </div>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary btn-large">
                Start Reporting Now
              </Link>
              <Link to="/login" className="btn btn-secondary btn-large">
                Sign In
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-graphic">
              <Shield size={120} strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="features">
        <div className="features-wrapper">
          <div className="section-header">
            <h2>Why Choose CrimeSafeNet?</h2>
            <p>Built for the modern community</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <MapPin size={32} />
              </div>
              <h3>Location Tracking</h3>
              <p>Report crimes with exact GPS coordinates or select locations on an interactive map.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FileText size={32} />
              </div>
              <h3>Easy Reporting</h3>
              <p>Submit detailed crime information in seconds with optional photo and video evidence.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <BarChart3 size={32} />
              </div>
              <h3>Global Analytics</h3>
              <p>View crime data on an interactive world map with location-based filtering.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Lock size={32} />
              </div>
              <h3>Secure & Private</h3>
              <p>Your data is encrypted with bcrypt security and protected with JWT authentication.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Zap size={32} />
              </div>
              <h3>Real-Time Updates</h3>
              <p>Get instant notifications and status updates on reported crimes in your area.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Users size={32} />
              </div>
              <h3>Community Driven</h3>
              <p>Join thousands of citizens and law enforcement working together for safety.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="how-it-works-wrapper">
          <div className="section-header">
            <h2>How CrimeSafeNet Works</h2>
            <p>4 simple steps to report and track crimes</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Create Account</h3>
              <p>Sign up as a Citizen or Police Officer with secure email verification.</p>
              <div className="step-icon">👤</div>
            </div>
            <div className="step-connector"></div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Report Crime</h3>
              <p>Submit crime details with location, photos, and evidence in minutes.</p>
              <div className="step-icon">📍</div>
            </div>
            <div className="step-connector"></div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Real-Time Tracking</h3>
              <p>Monitor your report status and receive updates from law enforcement.</p>
              <div className="step-icon">📊</div>
            </div>
            <div className="step-connector"></div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Community Safety</h3>
              <p>Contribute to a safer community and access global crime analytics.</p>
              <div className="step-icon">🛡️</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="benefits">
        <div className="benefits-wrapper">
          <div className="section-header">
            <h2>For Citizens</h2>
            <p>Report crimes safely and anonymously</p>
          </div>
          <div className="benefits-content">
            <div className="benefits-list">
              <div className="benefit-item">
                <CheckCircle size={24} />
                <div>
                  <h4>Anonymous Reporting</h4>
                  <p>Report crimes while maintaining your privacy</p>
                </div>
              </div>
              <div className="benefit-item">
                <CheckCircle size={24} />
                <div>
                  <h4>Evidence Upload</h4>
                  <p>Attach photos and videos to strengthen your report</p>
                </div>
              </div>
              <div className="benefit-item">
                <CheckCircle size={24} />
                <div>
                  <h4>Report History</h4>
                  <p>Track all your submissions and their current status</p>
                </div>
              </div>
            </div>
            <div className="benefits-list">
              <div className="benefit-item">
                <CheckCircle size={24} />
                <div>
                  <h4>Location Sharing</h4>
                  <p>Choose GPS, map, or manual address entry</p>
                </div>
              </div>
              <div className="benefit-item">
                <CheckCircle size={24} />
                <div>
                  <h4>Crime Analytics</h4>
                  <p>View worldwide crime data and local incidents</p>
                </div>
              </div>
              <div className="benefit-item">
                <CheckCircle size={24} />
                <div>
                  <h4>Instant Notifications</h4>
                  <p>Get updates as police officers respond to crimes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-wrapper">
          <h2>Ready to Make Your Community Safer?</h2>
          <p>Join thousands of citizens and law enforcement officers using CrimeSafeNet</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary btn-large">
              Create Free Account
            </Link>
            <Link to="/login" className="btn btn-secondary-light btn-large">
              Already a Member? Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="footer-cta">
        <div className="footer-content">
          <div className="footer-col">
            <h4>Safety First</h4>
            <p>Your security is our priority with enterprise-grade encryption</p>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <p>24/7 customer support and community guidelines</p>
          </div>
          <div className="footer-col">
            <h4>Trust</h4>
            <p>Used by law enforcement and citizens worldwide</p>
          </div>
        </div>
      </section>
    </div>
  );
}
