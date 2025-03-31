import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import BudgetProgressBar from './BudgetProgressBar';
import { getBudgets } from '@/lib/db';
import { Budget } from '@shared/schema';

const BudgetOverview: React.FC = () => {
  const [, setLocation] = useLocation();
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    const loadBudgets = async () => {
      const { budgets } = await getBudgets();
      setBudgets(budgets.slice(0, 4)); // Show only top 4 budgets
    };
    
    loadBudgets();
  }, []);

  const handleViewAllBudgets = () => {
    setLocation('/budgets');
  };

  return (
    <section>
      <Card className="bg-white p-5 h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Budget Overview</h2>
          <button 
            className="text-primary text-sm font-medium flex items-center"
            onClick={handleViewAllBudgets}
          >
            View All
            <svg className="w-4 h-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        {/* Budget Progress Bars */}
        {budgets.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-textGray">No budgets found. Add a budget to get started.</p>
            <button 
              className="mt-4 text-primary text-sm font-medium"
              onClick={() => setLocation('/budgets')}
            >
              Add Budget
            </button>
          </div>
        ) : (
          budgets.map((budget) => (
            <BudgetProgressBar key={budget.id} budget={budget} />
          ))
        )}
      </Card>
    </section>
  );
};

export default BudgetOverview;
