import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import InsightCard from './InsightCard';
import { getFinancialData } from '@/lib/db';
import { Budget, Transaction } from '@shared/schema';

interface Insight {
  type: 'warning' | 'success' | 'info';
  title: string;
  message: string;
  icon: string;
}

const FinancialInsights: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    const generateInsights = async () => {
      const { budgets, transactions } = await getFinancialData();
      const generatedInsights: Insight[] = [];

      // Check for over-budget categories
      const overBudgetItems = budgets.filter(budget => {
        // Safely handle spent by treating it as 0 if null or undefined
        const spent = typeof budget.spent === 'number' ? budget.spent : 0;
        return spent > budget.amount;
      });
      
      if (overBudgetItems.length > 0) {
        const worstOffender = overBudgetItems.reduce((prev, current) => {
          const prevSpent = typeof prev.spent === 'number' ? prev.spent : 0;
          const currentSpent = typeof current.spent === 'number' ? current.spent : 0;
          
          return (currentSpent - current.amount) > (prevSpent - prev.amount) ? current : prev;
        });
        
        const spentAmount = typeof worstOffender.spent === 'number' ? worstOffender.spent : 0;
        const overspentAmount = (spentAmount - worstOffender.amount).toFixed(2);
        
        generatedInsights.push({
          type: 'warning',
          title: `${worstOffender.category} Budget Alert`,
          message: `You've exceeded your ${worstOffender.category.toLowerCase()} budget by $${overspentAmount} this month.`,
          icon: 'warning'
        });
      }

      // Check for savings opportunities
      const foodDining = transactions.filter(t => 
        t.type === 'expense' && 
        t.category === 'Food & Dining' &&
        new Date(t.date).getMonth() === new Date().getMonth()
      );
      
      const foodSpend = foodDining.reduce((sum, t) => sum + t.amount, 0);
      if (foodSpend > 350) {
        const potentialSavings = Math.round(foodSpend * 0.25);
        generatedInsights.push({
          type: 'success',
          title: 'Savings Opportunity',
          message: `You could save $${potentialSavings} by reducing restaurant expenses.`,
          icon: 'savings'
        });
      }

      // Check for spending patterns
      const currentMonth = new Date().getMonth();
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      
      const currentUtilities = transactions.filter(t => 
        t.type === 'expense' && 
        t.category === 'Utilities' &&
        new Date(t.date).getMonth() === currentMonth
      ).reduce((sum, t) => sum + t.amount, 0);
      
      const previousUtilities = transactions.filter(t => 
        t.type === 'expense' && 
        t.category === 'Utilities' &&
        new Date(t.date).getMonth() === previousMonth
      ).reduce((sum, t) => sum + t.amount, 0);
      
      if (previousUtilities > 0 && currentUtilities < previousUtilities) {
        const percentDecrease = Math.round((previousUtilities - currentUtilities) / previousUtilities * 100);
        generatedInsights.push({
          type: 'info',
          title: 'Spending Pattern',
          message: `Your utility bills have decreased ${percentDecrease}% compared to last month.`,
          icon: 'insights'
        });
      }

      // If we don't have enough insights, add a default one
      if (generatedInsights.length === 0) {
        generatedInsights.push({
          type: 'info',
          title: 'Welcome to FinTrack',
          message: 'Add more transactions to see personalized financial insights here.',
          icon: 'tips_and_updates'
        });
      }

      setInsights(generatedInsights);
    };

    generateInsights();
  }, []);

  return (
    <section>
      <Card className="bg-white p-5">
        <h2 className="text-lg font-semibold mb-4">Financial Insights</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => (
            <InsightCard key={index} insight={insight} />
          ))}
        </div>
      </Card>
    </section>
  );
};

export default FinancialInsights;
