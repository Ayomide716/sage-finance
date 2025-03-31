import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TransactionItem from '@/components/TransactionItem';
import { getTransactions } from '@/lib/db';
import { Transaction } from '@shared/schema';
import { Dialog } from '@/components/ui/dialog';
import AddTransactionModal from '@/components/AddTransactionModal';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);

  useEffect(() => {
    // Set document title
    document.title = 'Transactions - FinTrack';
    
    const loadTransactions = async () => {
      const { transactions } = await getTransactions();
      
      // Sort by date (newest first)
      const sortedTransactions = transactions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setTransactions(sortedTransactions);
      setFilteredTransactions(sortedTransactions);
    };
    
    loadTransactions();
  }, []);

  useEffect(() => {
    // Apply filters
    let result = transactions;
    
    // Filter by type
    if (filterType !== 'all') {
      result = result.filter((t) => t.type === filterType);
    }
    
    // Filter by category
    if (filterCategory !== 'all') {
      result = result.filter((t) => t.category === filterCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (t) => t.description.toLowerCase().includes(term) || 
               t.category.toLowerCase().includes(term)
      );
    }
    
    setFilteredTransactions(result);
  }, [transactions, filterType, filterCategory, searchTerm]);

  // Get unique categories from transactions
  const uniqueCategories = [...new Set(transactions.map((t) => t.category))];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <Button 
          className="bg-primary text-white"
          onClick={() => setIsAddTransactionModalOpen(true)}
        >
          <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-textGray mb-1">Search</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textGray" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input 
                type="text" 
                placeholder="Search transactions" 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-textGray mb-1">Type</label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-textGray mb-1">Category</label>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Transactions List */}
      <Card className="bg-white rounded-lg overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 text-textGray mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-textGray">No transactions found</p>
            {(filterType !== 'all' || filterCategory !== 'all' || searchTerm) && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setFilterType('all');
                  setFilterCategory('all');
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-borderGray">
            {filteredTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        )}
      </Card>

      {/* Add Transaction Modal */}
      <Dialog open={isAddTransactionModalOpen} onOpenChange={setIsAddTransactionModalOpen}>
        <AddTransactionModal onClose={() => setIsAddTransactionModalOpen(false)} />
      </Dialog>
    </div>
  );
};

export default Transactions;
