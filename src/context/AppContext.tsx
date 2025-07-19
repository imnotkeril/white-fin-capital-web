import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

// Simplified types without API dependencies
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: Date;
}

export interface AppContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      duration: notification.duration ?? 5000, // Default 5 seconds
    };

    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Auto-remove notifications after their duration
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    notifications.forEach(notification => {
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
  }, [notifications, removeNotification]);

  const value: AppContextType = {
    isLoading,
    setIsLoading,
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
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

// Convenience hooks for specific functionality
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
      addNotification({
        type: 'success',
        title,
        ...(message && { message }),
        ...(duration !== undefined && { duration })
      }),
    notifyError: (title: string, message?: string, duration?: number) =>
      addNotification({
        type: 'error',
        title,
        ...(message && { message }),
        ...(duration !== undefined && { duration })
      }),
    notifyWarning: (title: string, message?: string, duration?: number) =>
      addNotification({
        type: 'warning',
        title,
        ...(message && { message }),
        ...(duration !== undefined && { duration })
      }),
    notifyInfo: (title: string, message?: string, duration?: number) =>
      addNotification({
        type: 'info',
        title,
        ...(message && { message }),
        ...(duration !== undefined && { duration })
      }),
  };
}

export function useLoading() {
  const { isLoading, setIsLoading } = useApp();
  return { isLoading, setIsLoading };
}