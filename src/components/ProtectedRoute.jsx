import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading, error } = useAuth();

  console.log('🛡️ PROTECTED ROUTE - loading:', loading, 'user:', user?.full_name, 'role:', user?.role, 'required roles:', roles);
  console.log('ProtectedRoute - loading:', loading, 'user:', user, 'required roles:', roles);

  if (loading) {
    console.log('⏳ Still loading user data...');
    console.log('Still loading user data...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
          <p className="text-xs text-gray-400 mt-2">Please wait...</p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">Error:</p>
              <p className="text-red-600 text-sm">{error}</p>
              <button 
                onClick={() => window.location.href = '/'}
                className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error && !user) {
    console.log('❌ Auth error occurred:', error);
    console.log('Auth error occurred:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Authentication Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Please try logging in again.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }
  if (!user) {
    console.log('🚫 No user found, redirecting to login');
    console.log('No user found, redirecting to login');
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    console.log('⛔ User role', user.role, 'not in required roles:', roles);
    console.log('User role', user.role, 'not in required roles:', roles);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('✅ Access granted for user:', user.full_name, 'with role:', user.role);
  console.log('Access granted for user:', user.full_name, 'with role:', user.role);
  return <>{children}</>;
};

export default ProtectedRoute;