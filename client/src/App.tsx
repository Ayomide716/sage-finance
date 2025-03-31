import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Budgets from "@/pages/Budgets";
import Reports from "@/pages/Reports";
import Goals from "@/pages/Goals";
import Login from "@/pages/Login";
import AppHeader from "@/components/AppHeader";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { initDB } from "@/lib/db";
import { initPWA } from "@/lib/pwa";
import { AuthProvider, useAuth } from "@/lib/auth";
import { NotificationsProvider, useNotifications } from "@/lib/notifications";

function Router() {
  const { user } = useAuth();
  
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      <Route path="/">
        {() => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/transactions">
        {() => (
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/budgets">
        {() => (
          <ProtectedRoute>
            <Budgets />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/reports">
        {() => (
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/goals">
        {() => (
          <ProtectedRoute>
            <Goals />
          </ProtectedRoute>
        )}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { user } = useAuth();
  const { checkBudgetAlerts } = useNotifications();

  useEffect(() => {
    // Initialize the database and PWA features
    const initialization = async () => {
      try {
        setIsInitializing(true);
        
        // Initialize IndexedDB
        await initDB();
        console.log("Database initialized successfully");
        setIsDbInitialized(true);
        
        // Initialize PWA features
        initPWA();
        
      } catch (error) {
        console.error("Error initializing app:", error);
      } finally {
        setIsInitializing(false);
      }
    };
    
    initialization();
  }, []);

  // Check for budget alerts when user logs in or changes
  useEffect(() => {
    if (user && isDbInitialized) {
      // Check budget alerts on initial load
      checkBudgetAlerts();
      
      // Set up interval to check budget alerts periodically
      const alertInterval = setInterval(() => {
        checkBudgetAlerts();
      }, 5 * 60 * 1000); // Check every 5 minutes
      
      return () => clearInterval(alertInterval);
    }
  }, [user, isDbInitialized, checkBudgetAlerts]);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-mediumGray">
        <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-textDark">Initializing application...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-mediumGray">
      <AppHeader />
      <div className="flex-1">
        <Router />
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationsProvider>
          <AppContent />
          <Toaster />
        </NotificationsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
