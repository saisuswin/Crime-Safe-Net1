import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, AlertCircle, Zap } from 'lucide-react';
import './Home.css';

export function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to CrimeSafeNet</h1>
          <p className="hero-subtitle">Your Community's Safety Platform</p>
          <p className="hero-description">
            CrimeSafeNet is a modern platform that connects citizens and law enforcement 
            to create safer communities through transparent crime reporting and rapid response.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Sign In
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <Shield size={200} strokeWidth={1} />
        </div>
      </section>

      <section className="features">
        <h2>Why CrimeSafeNet?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <AlertCircle size={40} />
            <h3>Easy Reporting</h3>
            <p>Report crimes instantly from your smartphone or computer with detailed information.</p>
          </div>
          <div className="feature-card">
            <Users size={40} />
            <h3>Community Driven</h3>
            <p>Join thousands of citizens working together to make our neighborhoods safer.</p>
          </div>
          <div className="feature-card">
            <Zap size={40} />
            <h3>Real-Time Updates</h3>
            <p>Get instant notifications and updates on reported crimes in your area.</p>
          </div>
          <div className="feature-card">
            <Shield size={40} />
            <h3>Secure & Private</h3>
            <p>Your data is encrypted and protected. Report safely and securely.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Account</h3>
            <p>Sign up as a Citizen or Police Officer</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Report Crime</h3>
            <p>Submit detailed crime information quickly</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Track Status</h3>
            <p>Monitor your report in real-time</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Stay Safe</h3>
            <p>Contribute to a safer community</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Help Keep Your Community Safe?</h2>
        <p>Join CrimeSafeNet today and be part of the solution</p>
        <Link to="/register" className="btn btn-primary">
          Create Your Account
        </Link>
      </section>
    </div>
  );
}
