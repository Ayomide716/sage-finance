import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import TransactionItem from './TransactionItem';
import { getTransactions } from '@/lib/db';
import { Transaction } from '@shared/schema';
import { useQuery } from '@tanstack/react-query';

const RecentTransactions: React.FC = () => {
  const [, setLocation] = useLocation();
  
  // Use React Query to fetch transactions
  const { data, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const result = await getTransactions();
      // Sort by date and get the most recent
      return result.transactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 4); // Show only 4 most recent transactions
    }
  });
  
  // Store the transactions data
  const transactions = data || [];

  const handleViewAllTransactions = () => {
    setLocation('/transactions');
  };

  return (
    <section className="mb-8">
      <Card className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-borderGray">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <button 
            className="text-primary text-sm font-medium flex items-center"
            onClick={handleViewAllTransactions}
          >
            View All
            <svg className="w-4 h-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        {/* Transaction List */}
        {transactions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-textGray">No transactions found. Add a transaction to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-borderGray">
            {transactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        )}
      </Card>
    </section>
  );
};

export default RecentTransactions;
