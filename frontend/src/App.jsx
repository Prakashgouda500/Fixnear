import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Protected Route Guard
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import TechnicianLayout from './layouts/TechnicianLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';

// Shared Pages
import FixAI from './pages/FixAI';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CreateRequest from './pages/customer/CreateRequest';
import TrackRequest from './pages/customer/TrackRequest';
import CustomerProfile from './pages/customer/CustomerProfile';

// Technician Pages
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import TechnicianProfile from './pages/technician/TechnicianProfile';
import TechnicianEarnings from './pages/technician/TechnicianEarnings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageTechnicians from './pages/admin/ManageTechnicians';
import ManageCategories from './pages/admin/ManageCategories';
import ViewServiceRequests from './pages/admin/ViewServiceRequests';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Customer Protected Routes */}
          <Route
            path="/customer"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CustomerDashboard />} />
            <Route path="create" element={<CreateRequest />} />
            <Route path="track/:id" element={<TrackRequest />} />
            <Route path="profile" element={<CustomerProfile />} />
          </Route>

          {/* Shared Protected Pages (e.g. FixAI is inside Customer layout) */}
          <Route
            path="/fixai"
            element={
              <ProtectedRoute allowedRoles={['customer', 'technician', 'admin']}>
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<FixAI />} />
          </Route>

          {/* Technician Protected Routes */}
          <Route
            path="/technician"
            element={
              <ProtectedRoute allowedRoles={['technician']}>
                <TechnicianLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TechnicianDashboard />} />
            <Route path="profile" element={<TechnicianProfile />} />
            <Route path="earnings" element={<TechnicianEarnings />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="technicians" element={<ManageTechnicians />} />
            <Route path="categories" element={<ManageCategories />} />
            <Route path="requests" element={<ViewServiceRequests />} />
          </Route>

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
