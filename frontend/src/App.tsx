import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { DonorDashboard } from './pages/donor/DonorDashboard';
import { BloodSearchPage } from './pages/seeker/BloodSearchPage';
import { HospitalDashboard } from './pages/hospital/HospitalDashboard';
import Seeker1 from './pages/seeker/Seeker1';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/seeker/search" element={<BloodSearchPage />} />

              {/* Protected Seeker Routes */}
              <Route
                path="/seeker/request"
                element={
                  <ProtectedRoute allowedRoles={['seeker']}>
                    <Seeker1 />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/seeker/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['seeker']}>
                    <Seeker1 />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Donor Routes */}
              <Route
                path="/donor/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['donor']}>
                    <DonorDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Hospital Routes */}
              <Route
                path="/hospital/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['hospital']}>
                    <HospitalDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Role-specific login redirects */}
              <Route path="/admin/login" element={<LoginPage />} />
              <Route path="/donor/login" element={<LoginPage />} />
              <Route path="/hospital/login" element={<LoginPage />} />

              {/* Fallback for unauthorized access */}
              <Route
                path="/unauthorized"
                element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized Access</h1>
                      <p className="text-gray-600">You don't have permission to access this page.</p>
                    </div>
                  </div>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
