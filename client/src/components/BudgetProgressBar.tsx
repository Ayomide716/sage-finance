import { Budget } from '@shared/schema';

interface BudgetProgressBarProps {
  budget: Budget;
}

const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({ budget }) => {
  // Calculate percentage used (handle possible null/undefined spent value)
  const spent = typeof budget.spent === 'number' ? budget.spent : 0;
  const percentUsed = (spent / budget.amount) * 100;
  const isOverBudget = percentUsed > 100;
  
  // Determine color based on percentage
  const getColorClass = () => {
    if (percentUsed >= 100) return 'bg-danger';
    if (percentUsed >= 90) return 'bg-warning';
    if (percentUsed >= 70) return 'bg-primary';
    return 'bg-success';
  };

  // Get icon based on category
  const getIconForCategory = () => {
    switch (budget.category) {
      case 'Food & Dining':
        return 'restaurant';
      case 'Housing':
        return 'home';
      case 'Transportation':
        return 'directions_car';
      case 'Shopping':
        return 'shopping_bag';
      case 'Utilities':
        return 'bolt';
      case 'Entertainment':
        return 'theaters';
      case 'Healthcare':
        return 'local_hospital';
      default:
        return 'account_balance_wallet';
    }
  };

  // Get icon color based on category
  const getIconColorClass = () => {
    switch (budget.category) {
      case 'Food & Dining':
        return 'text-primary';
      case 'Housing':
        return 'text-warning';
      case 'Transportation':
        return 'text-success';
      case 'Shopping':
        return 'text-danger';
      case 'Utilities':
        return 'text-primary';
      case 'Entertainment':
        return 'text-warning';
      case 'Healthcare':
        return 'text-success';
      default:
        return 'text-primary';
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          <svg className={`w-5 h-5 mr-2 ${getIconColorClass()}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {getIconForCategory() === 'restaurant' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18" />}
            {getIconForCategory() === 'home' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />}
            {getIconForCategory() === 'directions_car' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />}
            {getIconForCategory() === 'shopping_bag' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />}
            {getIconForCategory() === 'bolt' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />}
            {getIconForCategory() === 'theaters' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />}
            {getIconForCategory() === 'local_hospital' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />}
            {getIconForCategory() === 'account_balance_wallet' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />}
          </svg>
          <h3 className="font-medium">{budget.category}</h3>
        </div>
        <p className="text-sm font-medium">
          {formatCurrency(spent)} / {formatCurrency(budget.amount)}
        </p>
      </div>
      <div className="h-2 bg-borderGray rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColorClass()} rounded-full`} 
          style={{ width: `${Math.min(percentUsed, 100)}%` }}
        ></div>
      </div>
      <p className={`text-xs mt-1 ${isOverBudget ? 'text-danger' : 'text-textGray'}`}>
        {isOverBudget 
          ? `Over budget by ${formatCurrency(spent - budget.amount)}` 
          : `${Math.round(percentUsed)}% of budget used`
        }
      </p>
    </div>
  );
};

export default BudgetProgressBar;
