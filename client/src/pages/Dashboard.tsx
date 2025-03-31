import { useEffect } from 'react';
import SummaryCards from '@/components/SummaryCards';
import BudgetOverview from '@/components/BudgetOverview';
import RecentTransactions from '@/components/RecentTransactions';
import FinancialInsights from '@/components/FinancialInsights';
import InstallBanner from '@/components/InstallBanner';

const Dashboard: React.FC = () => {
  useEffect(() => {
    // Set document title
    document.title = 'Dashboard - FinTrack';
  }, []);

  return (
    <>
      {/* PWA Install Banner */}
      <InstallBanner />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 pb-20 pt-6">
        {/* Responsive grid layout that adapts for all screen sizes */}
        <div className="mb-6">
          <SummaryCards />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-1">
            <BudgetOverview />
          </div>
          <div className="lg:col-span-1">
            <RecentTransactions />
          </div>
          <div className="lg:col-span-2">
            <FinancialInsights />
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
