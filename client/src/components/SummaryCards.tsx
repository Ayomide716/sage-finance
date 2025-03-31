import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { getFinancialData } from '@/lib/db';
import { useQuery } from '@tanstack/react-query';
import { Transaction } from '@shared/schema';

interface SummaryData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  balanceChange: number;
  incomeChange: number;
  expenseChange: number;
}

const SummaryCards: React.FC = () => {
  // Use React Query to fetch financial data
  const { data, isLoading } = useQuery({
    queryKey: ['financial-data'],
    queryFn: async () => {
      const result = await getFinancialData();
      return result.transactions;
    }
  });
  
  // Calculate summary data based on transactions
  const summaryData = useMemo(() => {
    // Default summary data
    const defaultSummary: SummaryData = {
      totalBalance: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      balanceChange: 0,
      incomeChange: 0,
      expenseChange: 0
    };
    
    // If no data yet, return defaults
    if (!data) return defaultSummary;
    
    const transactions: Transaction[] = data;
    
    // Calculate total balance
    const totalBalance = transactions.reduce((sum, t) => 
      sum + (t.type === 'income' ? t.amount : -t.amount), 0);
    
    // Get this month's transactions
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    const thisMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === thisMonth && date.getFullYear() === thisYear;
    });
    
    // Last month's transactions
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    
    const lastMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });
    
    // Calculate monthly income and expenses
    const monthlyIncome = thisMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = thisMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate last month's income and expenses
    const lastMonthIncome = lastMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const lastMonthExpenses = lastMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate changes - handle edge cases better
    // Balance change calculation
    let balanceChange = 0;
    const lastMonthNet = lastMonthIncome - lastMonthExpenses;
    const thisMonthNet = monthlyIncome - monthlyExpenses;
    
    if (lastMonthNet !== 0) {
      // If last month had non-zero net, calculate percent change
      balanceChange = ((thisMonthNet - lastMonthNet) / Math.abs(lastMonthNet)) * 100;
    } else if (lastMonthNet === 0 && thisMonthNet !== 0) {
      // If last month was 0 but this month isn't, show 100% change
      balanceChange = thisMonthNet > 0 ? 100 : -100;
    }
    
    // Income change calculation
    let incomeChange = 0;
    if (lastMonthIncome > 0) {
      // Normal calculation if last month had income
      incomeChange = ((monthlyIncome - lastMonthIncome) / lastMonthIncome) * 100;
    } else if (lastMonthIncome === 0 && monthlyIncome > 0) {
      // New income this month
      incomeChange = 100;
    }
    
    // Expense change calculation
    let expenseChange = 0;
    if (lastMonthExpenses > 0) {
      // Normal calculation if last month had expenses
      expenseChange = ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
    } else if (lastMonthExpenses === 0 && monthlyExpenses > 0) {
      // New expenses this month
      expenseChange = 100;
    }
    
    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      balanceChange,
      incomeChange,
      expenseChange
    };
  }, [data]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Format percentage change
  const formatPercentage = (percent: number) => {
    // If no change, show as 0%
    if (percent === 0) return '0.0%';
    
    // If very large percentage, cap it
    if (Math.abs(percent) > 1000) return '999+%';
    
    // Normal case: show with 1 decimal place
    return `${Math.abs(percent).toFixed(1)}%`;
  };

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Balance Card */}
        <Card className="bg-white p-4 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-medium text-textGray">Total Balance</h2>
            <svg className="w-5 h-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <p className="text-2xl font-semibold">{formatCurrency(summaryData.totalBalance)}</p>
          <div className="flex items-center mt-2 text-xs">
            <span className={`inline-flex items-center ${summaryData.balanceChange >= 0 ? 'text-success' : 'text-danger'}`}>
              <svg 
                className="w-4 h-4 mr-1" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={summaryData.balanceChange >= 0 
                    ? "M5 10l7-7m0 0l7 7m-7-7v18" 
                    : "M19 14l-7 7m0 0l-7-7m7 7V3"} 
                />
              </svg>
              {formatPercentage(summaryData.balanceChange)}
            </span>
            <span className="text-textGray ml-2">from last month</span>
          </div>
        </Card>

        {/* Income Card */}
        <Card className="bg-white p-4 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-medium text-textGray">Income</h2>
            <svg className="w-5 h-5 text-success" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-2xl font-semibold">{formatCurrency(summaryData.monthlyIncome)}</p>
          <div className="flex items-center mt-2 text-xs">
            <span className={`inline-flex items-center ${summaryData.incomeChange >= 0 ? 'text-success' : 'text-danger'}`}>
              <svg 
                className="w-4 h-4 mr-1" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={summaryData.incomeChange >= 0 
                    ? "M5 10l7-7m0 0l7 7m-7-7v18" 
                    : "M19 14l-7 7m0 0l-7-7m7 7V3"} 
                />
              </svg>
              {formatPercentage(summaryData.incomeChange)}
            </span>
            <span className="text-textGray ml-2">from last month</span>
          </div>
        </Card>

        {/* Expenses Card */}
        <Card className="bg-white p-4 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-medium text-textGray">Expenses</h2>
            <svg className="w-5 h-5 text-danger" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          </div>
          <p className="text-2xl font-semibold">{formatCurrency(summaryData.monthlyExpenses)}</p>
          <div className="flex items-center mt-2 text-xs">
            <span className={`inline-flex items-center ${summaryData.expenseChange <= 0 ? 'text-success' : 'text-danger'}`}>
              <svg 
                className="w-4 h-4 mr-1" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={summaryData.expenseChange <= 0 
                    ? "M5 10l7-7m0 0l7 7m-7-7v18" 
                    : "M19 14l-7 7m0 0l-7-7m7 7V3"} 
                />
              </svg>
              {formatPercentage(summaryData.expenseChange)}
            </span>
            <span className="text-textGray ml-2">from last month</span>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default SummaryCards;
