import React, { createContext, useState, useEffect, ReactNode } from 'react'; // Removed useContext
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient'; // Adjust path if needed

// Export the type
export interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean; // Added isAdmin flag
  loading: boolean;
  signOut: () => Promise<void>;
}

// Create and export the context with a default value
// Using 'null!' assertion to satisfy initial type check, will be populated by provider
export const AuthContext = createContext<AuthContextType>(null!);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false); // Added isAdmin state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setSession(session);
      setUser(currentUser);
      // Check for admin role in app_metadata
      setIsAdmin(currentUser?.app_metadata?.role === 'Admin');
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("Auth state changed:", _event, session);
        const currentUser = session?.user ?? null;
        setSession(session);
        setUser(currentUser);
        // Update admin status on auth change
        setIsAdmin(currentUser?.app_metadata?.role === 'Admin');
        // No need to set loading false here again, initial load is done
      }
    );

    // Cleanup listener on component unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Sign out function
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error signing out:", error);
        // Handle error appropriately, maybe show a toast
    }
    // State will update via onAuthStateChange listener
  };

  const value = {
    session,
    user,
    isAdmin, // Include isAdmin in the context value
    loading,
    signOut,
  };

  // Don't render children until initial session check is complete
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// useAuth hook moved to src/hooks/useAuth.ts
