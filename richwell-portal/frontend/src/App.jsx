
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

// Admin Pages (Phase 3)
import ProgramsPage from './pages/admin/ProgramsPage';
import SubjectsPage from './pages/admin/SubjectsPage';
import SectionsPage from './pages/admin/SectionsPage';
import AcademicTermsPage from './pages/admin/AcademicTermsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/setup-password" element={<PasswordSetup />} />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Professor Routes */}
          <Route
            path="/professor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Registrar Routes */}
          <Route
            path="/registrar/dashboard"
            element={
              <ProtectedRoute allowedRoles={['registrar']}>
                <RegistrarDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registrar/programs"
            element={
              <ProtectedRoute allowedRoles={['registrar', 'dean']}>
                <ProgramsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registrar/subjects"
            element={
              <ProtectedRoute allowedRoles={['registrar', 'dean']}>
                <SubjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registrar/sections"
            element={
              <ProtectedRoute allowedRoles={['registrar', 'dean']}>
                <SectionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registrar/terms"
            element={
              <ProtectedRoute allowedRoles={['registrar', 'dean']}>
                <AcademicTermsPage />
              </ProtectedRoute>
            }
          />

          {/* Admission Routes */}
          <Route
            path="/admission/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admission']}>
                <AdmissionDashboard />
              </ProtectedRoute>
            }
          />

          {/* Dean Routes */}
          <Route
            path="/dean/dashboard"
            element={
              <ProtectedRoute allowedRoles={['dean']}>
                <DeanDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dean/programs"
            element={
              <ProtectedRoute allowedRoles={['dean']}>
                <ProgramsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dean/subjects"
            element={
              <ProtectedRoute allowedRoles={['dean']}>
                <SubjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dean/sections"
            element={
              <ProtectedRoute allowedRoles={['dean']}>
                <SectionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dean/terms"
            element={
              <ProtectedRoute allowedRoles={['dean']}>
                <AcademicTermsPage />
              </ProtectedRoute>
            }
          />

          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;