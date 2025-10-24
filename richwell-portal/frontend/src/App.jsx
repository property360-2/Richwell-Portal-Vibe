// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth Pages
import Login from './pages/Login';
import PasswordSetup from './pages/PasswordSetup';

// Dashboard Pages
import StudentDashboard from './pages/dashboards/StudentDashboard';
import ProfessorDashboard from './pages/dashboards/ProfessorDashboard';
import RegistrarDashboard from './pages/dashboards/RegistrarDashboard';
import AdmissionDashboard from './pages/dashboards/AdmissionDashboard';
import DeanDashboard from './pages/dashboards/DeanDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/setup-password" element={<PasswordSetup />} />

          {/* Protected Routes - Student */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Professor */}
          <Route
            path="/professor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Registrar */}
          <Route
            path="/registrar/dashboard"
            element={
              <ProtectedRoute allowedRoles={['registrar']}>
                <RegistrarDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Admission */}
          <Route
            path="/admission/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admission']}>
                <AdmissionDashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Dean */}
          <Route
            path="/dean/dashboard"
            element={
              <ProtectedRoute allowedRoles={['dean']}>
                <DeanDashboard />
              </ProtectedRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404 Route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;