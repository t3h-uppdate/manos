import { useContext } from 'react';
import { AuthContext, AuthContextType } from '../context/AuthContext'; // Adjust path if AuthContext is moved or exported differently

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) { // Added null check for safety
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
