import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, Home, LogIn, FileText, BarChart3, AlertCircle, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Navigation.css';

export function Navigation() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  const navItems = user
    ? user.role === 'citizen'
      ? [
          { path: '/citizen-dashboard', label: 'Dashboard', icon: Home },
          { path: '/report-crime', label: 'Report Crime', icon: AlertCircle },
          { path: '/my-reports', label: 'My Reports', icon: FileText },
          { path: '/analytics', label: 'Analytics', icon: BarChart3 },
        ]
      : [
          { path: '/police-dashboard', label: 'Dashboard', icon: Home },
          { path: '/analytics', label: 'Analytics', icon: BarChart3 },
          { path: '/faq', label: 'FAQ', icon: HelpCircle },
        ]
    : [
        { path: '/', label: 'Home', icon: Home },
        { path: '/login', label: 'Login', icon: LogIn },
      ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🛡️ CrimeSafeNet
        </Link>

        <button
          className="hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`nav-link ${isActive(path) ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}

          {user && (
            <div className="nav-user">
              <span className="user-info">
                {user.name} ({user.role})
              </span>
              <button
                className="nav-logout"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
