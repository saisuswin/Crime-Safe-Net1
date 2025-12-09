import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ReportsProvider } from './context/ReportsContext';
import { Navigation } from './components/Navigation';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { PoliceDashboard } from './pages/PoliceDashboard';
import { ReportCrime } from './pages/ReportCrime';
import { MyReports } from './pages/MyReports';
import { ReportDetail } from './pages/ReportDetail';
import { Insights } from './pages/Insights';
import { Analytics } from './pages/Analytics';
import { FAQ } from './pages/FAQ';

import './App.css';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ReportsProvider>
          <Navigation />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Citizen Routes */}
            <Route
              path="/citizen-dashboard"
              element={
                <ProtectedRoute requiredRole="citizen">
                  <CitizenDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-crime"
              element={
                <ProtectedRoute requiredRole="citizen">
                  <ReportCrime />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-reports"
              element={
                <ProtectedRoute requiredRole="citizen">
                  <MyReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report/:id"
              element={
                <ProtectedRoute>
                  <ReportDetail />
                </ProtectedRoute>
              }
            />

            {/* Police Routes */}
            <Route
              path="/police-dashboard"
              element={
                <ProtectedRoute requiredRole="police">
                  <PoliceDashboard />
                </ProtectedRoute>
              }
            />

            {/* Shared Routes */}
            <Route
              path="/insights"
              element={
                <ProtectedRoute>
                  <Insights />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faq"
              element={
                <ProtectedRoute>
                  <FAQ />
                </ProtectedRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </ReportsProvider>
      </AuthProvider>
    </Router>
  );
}
