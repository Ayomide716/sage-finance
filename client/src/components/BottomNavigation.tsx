import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Dialog } from '@/components/ui/dialog';
import AddTransactionModal from './AddTransactionModal';

const BottomNavigation: React.FC = () => {
  const [location, setLocation] = useLocation();
  const [indicatorPosition, setIndicatorPosition] = useState(0);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

  useEffect(() => {
    // Set the indicator position based on the current route
    switch (location) {
      case '/':
        setIndicatorPosition(0);
        break;
      case '/transactions':
        setIndicatorPosition(1);
        break;
      case '/budgets':
        setIndicatorPosition(3);
        break;
      case '/reports':
        setIndicatorPosition(4);
        break;
      default:
        setIndicatorPosition(0);
    }
  }, [location]);

  const handleNavigate = (path: string, position: number) => {
    setLocation(path);
    setIndicatorPosition(position);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-10">
        <div className="relative">
          <div className="flex justify-around" role="tablist">
            <button 
              className={`flex flex-col items-center py-3 px-5 flex-1 ${indicatorPosition === 0 ? 'text-primary' : 'text-textGray'}`} 
              role="tab" 
              aria-selected={indicatorPosition === 0}
              onClick={() => handleNavigate('/', 0)}
            >
              <svg className="w-[22px] h-[22px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <span className="text-xs font-medium mt-1">Dashboard</span>
            </button>
            
            <button 
              className={`flex flex-col items-center py-3 px-5 flex-1 ${indicatorPosition === 1 ? 'text-primary' : 'text-textGray'}`} 
              role="tab" 
              aria-selected={indicatorPosition === 1}
              onClick={() => handleNavigate('/transactions', 1)}
            >
              <svg className="w-[22px] h-[22px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-xs font-medium mt-1">Transactions</span>
            </button>
            
            <div className="flex-1 flex justify-center">
              <button 
                className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center relative -top-5 shadow-md"
                onClick={() => setIsTransactionModalOpen(true)}
                aria-label="Add transaction"
              >
                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            
            <button 
              className={`flex flex-col items-center py-3 px-5 flex-1 ${indicatorPosition === 3 ? 'text-primary' : 'text-textGray'}`} 
              role="tab" 
              aria-selected={indicatorPosition === 3}
              onClick={() => handleNavigate('/budgets', 3)}
            >
              <svg className="w-[22px] h-[22px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              <span className="text-xs font-medium mt-1">Budgets</span>
            </button>
            
            <button 
              className={`flex flex-col items-center py-3 px-5 flex-1 ${indicatorPosition === 4 ? 'text-primary' : 'text-textGray'}`} 
              role="tab" 
              aria-selected={indicatorPosition === 4}
              onClick={() => handleNavigate('/reports', 4)}
            >
              <svg className="w-[22px] h-[22px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs font-medium mt-1">Reports</span>
            </button>
          </div>
          <div 
            className="tab-indicator h-1 bg-primary absolute top-0 left-0 w-1/5" 
            style={{ transform: `translateX(${indicatorPosition * 100}%)` }}
          ></div>
        </div>
      </nav>

      <Dialog open={isTransactionModalOpen} onOpenChange={setIsTransactionModalOpen}>
        <AddTransactionModal onClose={() => setIsTransactionModalOpen(false)} />
      </Dialog>
    </>
  );
};

export default BottomNavigation;
