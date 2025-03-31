import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { getFinancialData } from '@/lib/db';

interface SummaryData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  balanceChange: number;
  incomeChange: number;
  expenseChange: number;
}

const SummaryCards: React.FC = () => {
  const [summaryData, setSummaryData] = useState<SummaryData>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    balanceChange: 0,
    incomeChange: 0,
    expenseChange: 0
  });

  useEffect(() => {
    const loadSummaryData = async () => {
      const { transactions } = await getFinancialData();
      
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
      
      // Calculate changes
      const balanceChange = lastMonthIncome - lastMonthExpenses === 0 ? 0 :
        ((monthlyIncome - monthlyExpenses) - (lastMonthIncome - lastMonthExpenses)) / 
        Math.abs(lastMonthIncome - lastMonthExpenses) * 100;
      
      const incomeChange = lastMonthIncome === 0 ? 0 : 
        (monthlyIncome - lastMonthIncome) / lastMonthIncome * 100;
      
      const expenseChange = lastMonthExpenses === 0 ? 0 : 
        (monthlyExpenses - lastMonthExpenses) / lastMonthExpenses * 100;
      
      setSummaryData({
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        balanceChange,
        incomeChange,
        expenseChange
      });
    };
    
    loadSummaryData();
  }, []);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
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
              {Math.abs(summaryData.balanceChange).toFixed(1)}%
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
              {Math.abs(summaryData.incomeChange).toFixed(1)}%
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
              {Math.abs(summaryData.expenseChange).toFixed(1)}%
            </span>
            <span className="text-textGray ml-2">from last month</span>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default SummaryCards;
