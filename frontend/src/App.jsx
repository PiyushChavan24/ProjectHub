import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Register from './pages/Register';
import Login from './pages/Login';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import MentorDashboard from './pages/dashboards/MentorDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import ProjectGallery from './pages/ProjectGallery';
import ProjectDetail from './pages/ProjectDetail';
import SavedProjects from './pages/SavedProjects';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Role-protected routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mentor"
            element={
              <ProtectedRoute allowedRoles={['mentor']}>
                <MentorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Gallery — accessible by all authenticated roles */}
          <Route
            path="/gallery"
            element={
              <ProtectedRoute allowedRoles={['student', 'mentor', 'admin']}>
                <ProjectGallery />
              </ProtectedRoute>
            }
          />

          {/* Project detail — all authenticated roles */}
          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute allowedRoles={['student', 'mentor', 'admin']}>
                <ProjectDetail />
              </ProtectedRoute>
            }
          />

          {/* Saved projects — all authenticated roles */}
          <Route
            path="/saved"
            element={
              <ProtectedRoute allowedRoles={['student', 'mentor', 'admin']}>
                <SavedProjects />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
