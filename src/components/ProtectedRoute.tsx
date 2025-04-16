import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Import the hook

const ProtectedRoute: React.FC = () => {
  // Get auth state from context via hook
  const { session, user, loading } = useAuth();

  if (loading) {
    // Show loading indicator while checking auth state
    // Consider replacing with a more sophisticated loading component if available
    return <div>Loading...</div>;
  }

  // If no session, redirect to the ADMIN login page
  if (!session) {
    // Redirect specifically to the admin login, not the customer one
    return <Navigate to="/admin/login" replace />;
  }

  // If session exists, check the user's role in app_metadata
  if (user?.app_metadata?.role !== 'Admin') { // Corrected check based on user data
    // If logged in but not an admin, redirect to the home page
    return <Navigate to="/" replace />;
  }

  // If session exists and user is admin, render the nested admin routes
  return <Outlet />;
};

export default ProtectedRoute;
