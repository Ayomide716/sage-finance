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
        <SummaryCards />
        <BudgetOverview />
        <RecentTransactions />
        <FinancialInsights />
      </main>
    </>
  );
};

export default Dashboard;
