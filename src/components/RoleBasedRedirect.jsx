import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleBasedRedirect = () => {
  const { user, loading, error } = useAuth();
  const navigate = useNavigate();

  console.log('🔀 ROLE BASED REDIRECT - loading:', loading, 'user:', user?.full_name, 'role:', user?.role);

  useEffect(() => {
    console.log('🔄 RoleBasedRedirect useEffect triggered');
    console.log('Loading:', loading, 'User:', user, 'Error:', error);

    // Don't navigate if still loading
    if (loading) {
      console.log('⏳ Still loading, waiting...');
      return;
    }

    // Handle error case
    if (error && !user) {
      console.log('❌ RoleBasedRedirect - Auth error:', error);
      navigate('/', { replace: true });
      return;
    }

    // Handle no user case
    if (!user) {
      console.log('🚫 RoleBasedRedirect - No user, redirecting to login');
      navigate('/login', { replace: true });
      return;
    }

    console.log('🎯 RoleBasedRedirect - User found, role:', user.role, 'redirecting to dashboard');
    
    // Debug: Log the exact role value and type
    console.log('🔍 DEBUG - User role details:', {
      role: user.role,
      roleType: typeof user.role,
      roleLength: user.role?.length,
      trimmedRole: user.role?.trim(),
      email: user.email
    });
    
    // Navigate based on user role with simplified approach
    switch (user.role) {
      case 'admin':
        console.log('🔴 Redirecting to admin dashboard');
        console.log('🔍 CURRENT URL:', window.location.href);
        console.log('🔍 ATTEMPTING NAVIGATION TO: /test-admin');
        
        // Try navigating to test route first
        navigate('/test-admin', { replace: true });
        break;
      case 'hr':
        console.log('🟢 Redirecting to hr dashboard');
        navigate('/hr/dashboard', { replace: true });
        break;
      case 'manager':
        console.log('🔵 Redirecting to manager dashboard');
        navigate('/manager/dashboard', { replace: true });
        break;
      case 'employee':
        console.log('🟣 Redirecting to employee dashboard');
        navigate('/employee/dashboard', { replace: true });
        break;
      default:
        console.log('❓ Unknown role:', user.role, 'redirecting to login');
        console.log('🚨 FALLBACK - Available user data:', user);
        navigate('/', { replace: true });
        break;
    }
  }, [loading, user, error, navigate]);

  // Always show loading state while determining redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your profile...</p>
        <p className="text-xs text-gray-400 mt-2">Redirecting to dashboard...</p>
        {user && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm font-medium">Debug Info:</p>
            <p className="text-blue-600 text-sm">User: {user.full_name}</p>
            <p className="text-blue-600 text-sm">Role: {user.role}</p>
            <p className="text-blue-600 text-sm">Email: {user.email}</p>
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">Error:</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={() => navigate('/', { replace: true })}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleBasedRedirect;