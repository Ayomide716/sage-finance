import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Budgets from "@/pages/Budgets";
import Reports from "@/pages/Reports";
import BottomNavigation from "@/components/BottomNavigation";
import AppHeader from "@/components/AppHeader";
import { useEffect, useState } from "react";
import { initDB } from "@/lib/db";
import { initPWA } from "@/lib/pwa";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/budgets" component={Budgets} />
      <Route path="/reports" component={Reports} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isDbInitialized, setIsDbInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

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

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-mediumGray">
        <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
        <p className="mt-4 text-textDark">Initializing application...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen bg-mediumGray">
        <AppHeader />
        <div className="flex-1 pb-16">
          <Router />
        </div>
        <BottomNavigation />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
