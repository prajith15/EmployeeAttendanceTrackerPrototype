import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';

// Auth Components
import LoginPortalSelector from './components/auth/LoginPortalSelector';
import AdminLogin from './components/auth/AdminLogin';
import HRLogin from './components/auth/HRLogin';
import ManagerLogin from './components/auth/ManagerLogin';
import EmployeeLogin from './components/auth/EmployeeLogin';

// Dashboard Pages
import Dashboard from './pages/Dashboard';
import AdminDashboardPage from './pages/AdminDashboardPage';
import HRDashboardPage from './pages/HRDashboardPage';
import ManagerDashboardPage from './pages/ManagerDashboardPage';
import EmployeeDashboardPage from './pages/EmployeeDashboardPage';

// Management Pages
import UserManagement from './pages/UserManagement';
import LeaveManagement from './pages/LeaveManagement';

// Unauthorized Page
const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Access Denied</h1>
      <p className="text-gray-600 mb-8">You don't have permission to access this page.</p>
      <a
        href="/login-portal"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
      >
        Back to Login
      </a>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root - Role-based Login Portal */}
          <Route path="/" element={<LoginPortalSelector />} />
          
          {/* Dashboard redirect after login */}
          <Route path="/dashboard-redirect" element={<RoleBasedRedirect />} />
          
          {/* Individual Login Pages */}
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/hr-login" element={<HRLogin />} />
          <Route path="/manager-login" element={<ManagerLogin />} />
          <Route path="/employee-login" element={<EmployeeLogin />} />
          
          {/* Protected Dashboard Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Debug route to test admin dashboard directly */}
          <Route 
            path="/test-admin" 
            element={
              <AdminDashboardPage />
            } 
          />
          <Route 
            path="/hr/dashboard" 
            element={
              <ProtectedRoute roles={['hr']}>
                <HRDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/manager/dashboard" 
            element={
              <ProtectedRoute roles={['manager']}>
                <ManagerDashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employee/dashboard" 
            element={
              <ProtectedRoute roles={['employee']}>
                <EmployeeDashboardPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Generic Dashboard (fallback) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Management Pages */}
          <Route 
            path="/users" 
            element={
              <ProtectedRoute roles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/leave" 
            element={
              <ProtectedRoute>
                <LeaveManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/attendance" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/tasks" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/team" 
            element={
              <ProtectedRoute roles={['manager']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employees" 
            element={
              <ProtectedRoute roles={['hr']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute roles={['hr', 'manager']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute roles={['admin']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/policies" 
            element={
              <ProtectedRoute roles={['admin']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute roles={['admin']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute roles={['employee']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Unauthorized Page */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;