import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, AppContextType } from '@/types';
import { STORAGE_KEYS } from '@/utils/constants';

interface AppState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  notifications: Notification[];
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: Date;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' }
  | { type: 'RESET_STATE' };

const initialState: AppState = {
  user: null,
  isLoading: false,
  isInitialized: false,
  notifications: [],
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case 'SET_INITIALIZED':
      return {
        ...state,
        isInitialized: action.payload,
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
      };
    
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize app state
  useEffect(() => {
    const initializeApp = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Load user from localStorage
        const savedUser = localStorage.getItem(STORAGE_KEYS.user);
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
            dispatch({ type: 'SET_USER', payload: user });
          } catch (error) {
            console.warn('Failed to parse saved user data:', error);
            localStorage.removeItem(STORAGE_KEYS.user);
          }
        }
        
        // Additional initialization logic can go here
        // e.g., validate user session, fetch app configuration, etc.
        
      } catch (error) {
        console.error('Failed to initialize app:', error);
        addNotification({
          type: 'error',
          title: 'Initialization Error',
          message: 'Failed to initialize the application. Please refresh the page.',
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_INITIALIZED', payload: true });
      }
    };

    initializeApp();
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    try {
      if (state.user) {
        localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(state.user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.user);
      }
    } catch (error) {
      console.warn('Failed to save user to localStorage:', error);
    }
  }, [state.user]);

  // Auto-remove notifications after their duration
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    state.notifications.forEach(notification => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [state.notifications]);

  const setUser = (user: User | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const setIsLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const fullNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      duration: notification.duration ?? 5000, // Default 5 seconds
    };
    
    dispatch({ type: 'ADD_NOTIFICATION', payload: fullNotification });
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const clearNotifications = () => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  };

  const logout = () => {
    setUser(null);
    clearNotifications();
    // Clear other user-specific data
    try {
      localStorage.removeItem(STORAGE_KEYS.user);
      localStorage.removeItem(STORAGE_KEYS.preferences);
    } catch (error) {
      console.warn('Failed to clear user data from localStorage:', error);
    }
  };

  const resetApp = () => {
    dispatch({ type: 'RESET_STATE' });
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  };

  const value: AppContextType & {
    notifications: Notification[];
    isInitialized: boolean;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
    logout: () => void;
    resetApp: () => void;
  } = {
    user: state.user,
    setUser,
    isLoading: state.isLoading,
    setIsLoading,
    notifications: state.notifications,
    isInitialized: state.isInitialized,
    addNotification,
    removeNotification,
    clearNotifications,
    logout,
    resetApp,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  
  return context;
}

// Custom hooks for specific app state
export function useUser() {
  const { user, setUser } = useApp();
  return { user, setUser };
}

export function useNotifications() {
  const { 
    notifications, 
    addNotification, 
    removeNotification, 
    clearNotifications 
  } = useApp();
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    // Convenience methods for different notification types
    notifySuccess: (title: string, message?: string, duration?: number) =>
      addNotification({ type: 'success', title, ...(message && { message }), ...(duration && { duration }) }),
    notifyError: (title: string, message?: string, duration?: number) =>
      addNotification({ type: 'error', title, message, duration }),
    notifyWarning: (title: string, message?: string, duration?: number) =>
      addNotification({ type: 'warning', title, message, duration }),
    notifyInfo: (title: string, message?: string, duration?: number) =>
      addNotification({ type: 'info', title, message, duration }),
  };
}

export function useLoading() {
  const { isLoading, setIsLoading } = useApp();
  return { isLoading, setIsLoading };
}