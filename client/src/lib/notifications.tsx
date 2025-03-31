import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Budget, Transaction } from '@shared/schema';
import { getFinancialData } from './db';

export interface BudgetAlert {
  id: string;
  budgetId: number;
  category: string;
  threshold: number; // Percentage threshold (e.g., 80%, 90%, 100%)
  message: string;
  status: 'warning' | 'danger' | 'info';
  timestamp: Date;
  read: boolean;
}

interface NotificationsContextType {
  alerts: BudgetAlert[];
  unreadCount: number;
  checkBudgetAlerts: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAlerts: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
}

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const { toast } = useToast();
  
  // Get unread count
  const unreadCount = alerts.filter(alert => !alert.read).length;
  
  // Load alerts from local storage on initial load
  useEffect(() => {
    const savedAlerts = localStorage.getItem('budget-alerts');
    if (savedAlerts) {
      const parsedAlerts = JSON.parse(savedAlerts).map((alert: any) => ({
        ...alert,
        timestamp: new Date(alert.timestamp),
      }));
      setAlerts(parsedAlerts);
    }
  }, []);
  
  // Save alerts to local storage when they change
  useEffect(() => {
    if (alerts.length > 0) {
      localStorage.setItem('budget-alerts', JSON.stringify(alerts));
    }
  }, [alerts]);
  
  // Check all budgets against current spending
  const checkBudgetAlerts = async () => {
    try {
      const { transactions, budgets } = await getFinancialData();
      
      // Analyze each budget
      budgets.forEach(budget => {
        // Ensure spent is a number and not null
        const spent = budget.spent ?? 0;
        const spendingPercentage = (spent / budget.amount) * 100;
        
        // Create alerts based on thresholds
        if (spendingPercentage >= 100 && !hasExistingAlert(budget.id, 100)) {
          addAlert({
            budgetId: budget.id,
            category: budget.category,
            threshold: 100,
            message: `You have exceeded your ${budget.category} budget!`,
            status: 'danger',
          });
          
          toast({
            title: 'Budget Alert',
            description: `You have exceeded your ${budget.category} budget!`,
            variant: 'destructive',
          });
        } 
        else if (spendingPercentage >= 90 && spendingPercentage < 100 && !hasExistingAlert(budget.id, 90)) {
          addAlert({
            budgetId: budget.id,
            category: budget.category,
            threshold: 90,
            message: `You have used 90% of your ${budget.category} budget.`,
            status: 'warning',
          });
          
          toast({
            title: 'Budget Alert',
            description: `You have used 90% of your ${budget.category} budget.`,
            variant: 'default',
          });
        }
        else if (spendingPercentage >= 80 && spendingPercentage < 90 && !hasExistingAlert(budget.id, 80)) {
          addAlert({
            budgetId: budget.id,
            category: budget.category,
            threshold: 80,
            message: `You have used 80% of your ${budget.category} budget.`,
            status: 'info',
          });
        }
      });
    } catch (error) {
      console.error("Failed to check budget alerts:", error);
    }
  };
  
  // Check if there's already an alert for this budget at this threshold
  const hasExistingAlert = (budgetId: number, threshold: number): boolean => {
    return alerts.some(alert => 
      alert.budgetId === budgetId && 
      alert.threshold === threshold && 
      // Check if it's a different month (to allow new alerts for new months)
      isSameMonth(new Date(alert.timestamp), new Date())
    );
  };
  
  // Check if two dates are in the same month
  const isSameMonth = (date1: Date, date2: Date): boolean => {
    return date1.getMonth() === date2.getMonth() && 
           date1.getFullYear() === date2.getFullYear();
  };
  
  // Add a new alert
  const addAlert = (alertData: Omit<BudgetAlert, 'id' | 'timestamp' | 'read'>) => {
    const newAlert: BudgetAlert = {
      ...alertData,
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };
    
    setAlerts(prev => [newAlert, ...prev]);
  };
  
  // Mark alert as read
  const markAsRead = (id: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, read: true } : alert
      )
    );
  };
  
  // Mark all alerts as read
  const markAllAsRead = () => {
    setAlerts(prev => 
      prev.map(alert => ({ ...alert, read: true }))
    );
  };
  
  // Clear all alerts
  const clearAlerts = () => {
    setAlerts([]);
    localStorage.removeItem('budget-alerts');
  };
  
  return (
    <NotificationsContext.Provider
      value={{
        alerts,
        unreadCount,
        checkBudgetAlerts,
        markAsRead,
        markAllAsRead,
        clearAlerts
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};