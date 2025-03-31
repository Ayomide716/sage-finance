import { Transaction } from '@shared/schema';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  // Format currency
  const formatCurrency = (amount: number, isIncome: boolean) => {
    return (isIncome ? '+' : '-') + new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Get icon for transaction category
  const getIconForCategory = () => {
    switch (transaction.category) {
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
      case 'Income':
        return 'payments';
      default:
        return transaction.type === 'income' ? 'payments' : 'account_balance_wallet';
    }
  };

  // Get background color for icon
  const getIconBackgroundClass = () => {
    if (transaction.type === 'income') return 'bg-success/10';
    
    switch (transaction.category) {
      case 'Food & Dining':
        return 'bg-primary/10';
      case 'Housing':
        return 'bg-warning/10';
      case 'Transportation':
        return 'bg-warning/10';
      case 'Shopping':
        return 'bg-danger/10';
      default:
        return 'bg-primary/10';
    }
  };

  // Get text color for icon
  const getIconTextClass = () => {
    if (transaction.type === 'income') return 'text-success';
    
    switch (transaction.category) {
      case 'Food & Dining':
        return 'text-primary';
      case 'Housing':
        return 'text-warning';
      case 'Transportation':
        return 'text-warning';
      case 'Shopping':
        return 'text-danger';
      default:
        return 'text-primary';
    }
  };

  return (
    <div className="p-4 flex items-center">
      <div className={`h-10 w-10 rounded-full ${getIconBackgroundClass()} flex items-center justify-center mr-3`}>
        <svg className={`w-5 h-5 ${getIconTextClass()}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {getIconForCategory() === 'restaurant' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v18h18" />}
          {getIconForCategory() === 'home' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />}
          {getIconForCategory() === 'directions_car' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />}
          {getIconForCategory() === 'shopping_bag' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />}
          {getIconForCategory() === 'bolt' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />}
          {getIconForCategory() === 'theaters' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />}
          {getIconForCategory() === 'local_hospital' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />}
          {getIconForCategory() === 'payments' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />}
          {getIconForCategory() === 'account_balance_wallet' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />}
        </svg>
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{transaction.description || transaction.category}</h3>
        <p className="text-xs text-textGray">
          {formatDate(transaction.date)} · {transaction.category}
        </p>
      </div>
      <p className={`font-medium ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
        {formatCurrency(transaction.amount, transaction.type === 'income')}
      </p>
    </div>
  );
};

export default TransactionItem;
