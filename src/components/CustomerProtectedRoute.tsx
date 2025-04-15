import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Corrected import path

const CustomerProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Optional: Show a loading spinner or skeleton screen while checking auth state
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    // User not logged in, redirect to login page
    // Pass the current location they were trying to access as state
    // or as a query parameter so they can be redirected back after login.
    console.log('CustomerProtectedRoute: User not logged in, redirecting to login.');
    return <Navigate to={`/login?redirect=${location.pathname}${location.search}`} replace />;
  }

  // User is logged in, render the child route component
  return <Outlet />;
};

export default CustomerProtectedRoute;
