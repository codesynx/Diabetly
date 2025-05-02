import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getCurrentUser, getSession, signOut } from './supabase';
import type { User } from '@supabase/supabase-js';
import { UserSubscription } from './supabase';
import { getUserSubscription } from './user-credits-service';
import { clearUserData } from './storage-service';

interface AuthContextType {
  user: User | null;
  userSubscription: UserSubscription | null;
  isLoading: boolean;
  signOutUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshSubscription: () => Promise<UserSubscription | null>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  userSubscription: null,
  isLoading: true,
  signOutUser: async () => {},
  refreshUser: async () => {},
  refreshSubscription: async () => null,
});

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Function to refresh user data
  const refreshUser = async () => {
    try {
      const { user: currentUser, error } = await getCurrentUser();
      
      if (error) {
        console.error('Error refreshing user:', error);
        return;
      }
      
      if (currentUser) {
        setUser(currentUser);
        refreshSubscription();
      } else {
        // If no user, try to get session
        const { session, error: sessionError } = await getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          return;
        }
        
        if (session?.user) {
          setUser(session.user);
          refreshSubscription();
        } else {
          setUser(null);
          setUserSubscription(null);
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  // Function to refresh subscription data
  const refreshSubscription = async () => {
    if (user && user.id) {
      try {
        // Check if we've refreshed the subscription recently (within the last second)
        const now = Date.now();
        const lastRefreshKey = `last_subscription_refresh_${user.id}`;
        const lastRefreshTime = parseInt(sessionStorage.getItem(lastRefreshKey) || '0');
        
        // If we've refreshed within the last second, skip this refresh
        if (now - lastRefreshTime < 1000) {
          console.log('Skipping subscription refresh, too recent');
          return userSubscription;
        }
        
        // Update the last refresh time
        sessionStorage.setItem(lastRefreshKey, now.toString());
        
        console.log('Refreshing subscription for user:', user.id);
        const subscription = await getUserSubscription(user.id);
        console.log('Received subscription:', subscription);
        setUserSubscription(subscription);
        
        if (!subscription) {
          console.log('No active subscription found for user');
        } else {
          console.log('Subscription updated with credits:', subscription.credits_remaining);
        }
        
        return subscription;
      } catch (error) {
        console.error('Error refreshing subscription:', error);
        return null;
      }
    } else {
      console.log('Cannot refresh subscription: No user logged in');
      return null;
    }
  };

  // Function to sign out
  const signOutUser = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Error signing out:', error);
        return;
      }
      
      // Clear user data from localStorage
      if (user?.id) {
        clearUserData(user.id);
      }
      
      // Reset state
      setUser(null);
      setUserSubscription(null);
      
      // Clear any local storage related to the user
      localStorage.removeItem('diabetly_auth_token');
      
      // Force a page reload to ensure all states are cleared
      window.location.href = '/';
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        // Check for existing session
        const { session, error } = await getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        
        if (session?.user) {
          console.log('Found existing session:', session.user.email);
          setUser(session.user);
          const subscription = await getUserSubscription(session.user.id);
          setUserSubscription(subscription);
        } else {
          console.log('No active session found');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
        setAuthInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Set up auth state change listener
  useEffect(() => {
    if (!authInitialized) return;
    
    console.log('Setting up auth state change listener');
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          // When signing in, do refresh the subscription
          await refreshSubscription();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserSubscription(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user);
          // Don't automatically refresh subscription on token refresh
          // This can cause loops of refreshes
        }
      }
    );

    // Clean up subscription on unmount
    return () => {
      console.log('Cleaning up auth listener');
      authListener?.subscription.unsubscribe();
    };
  }, [authInitialized]);

  const value = {
    user,
    userSubscription,
    isLoading,
    signOutUser,
    refreshUser,
    refreshSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 