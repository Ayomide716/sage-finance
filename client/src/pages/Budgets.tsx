import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BudgetProgressBar from '@/components/BudgetProgressBar';
import { getBudgets, addBudget } from '@/lib/db';
import { Budget } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

const Budgets: React.FC = () => {
  const { toast } = useToast();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isAddBudgetModalOpen, setIsAddBudgetModalOpen] = useState(false);
  
  // New budget form state
  const [newBudgetCategory, setNewBudgetCategory] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');

  useEffect(() => {
    // Set document title
    document.title = 'Budgets - FinTrack';
    
    const loadBudgets = async () => {
      const { budgets } = await getBudgets();
      setBudgets(budgets);
    };
    
    loadBudgets();
  }, []);

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBudgetCategory) {
      toast({
        title: 'Category required',
        description: 'Please select a category for this budget.',
        variant: 'destructive'
      });
      return;
    }
    
    if (!newBudgetAmount || parseFloat(newBudgetAmount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount greater than zero.',
        variant: 'destructive'
      });
      return;
    }
    
    // Check if budget for this category already exists
    const existingBudget = budgets.find(b => b.category === newBudgetCategory);
    if (existingBudget) {
      toast({
        title: 'Budget already exists',
        description: `A budget for ${newBudgetCategory} already exists. Please edit the existing budget instead.`,
        variant: 'destructive'
      });
      return;
    }
    
    try {
      await addBudget({
        category: newBudgetCategory,
        amount: parseFloat(newBudgetAmount),
      });
      
      toast({
        title: 'Budget added',
        description: 'Your budget has been successfully created.',
        variant: 'success'
      });
      
      // Close modal and reset form
      setIsAddBudgetModalOpen(false);
      setNewBudgetCategory('');
      setNewBudgetAmount('');
      
      // Refresh budgets
      const { budgets: refreshedBudgets } = await getBudgets();
      setBudgets(refreshedBudgets);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add budget. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Budgets</h1>
        <Button 
          className="bg-primary text-white"
          onClick={() => setIsAddBudgetModalOpen(true)}
        >
          <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Budget
        </Button>
      </div>

      {/* Budgets List */}
      <Card className="bg-white p-5">
        {budgets.length === 0 ? (
          <div className="py-8 text-center">
            <svg className="w-12 h-12 text-textGray mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-textGray">No budgets found</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setIsAddBudgetModalOpen(true)}
            >
              Create Your First Budget
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-4">Monthly Budgets</h2>
            <div className="space-y-4">
              {budgets.map((budget) => (
                <BudgetProgressBar key={budget.id} budget={budget} />
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Add Budget Modal */}
      <Dialog open={isAddBudgetModalOpen} onOpenChange={setIsAddBudgetModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Budget</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleAddBudget}>
            <div className="mb-4">
              <Label htmlFor="category" className="block text-textDark font-medium mb-2">Category</Label>
              <Select value={newBudgetCategory} onValueChange={setNewBudgetCategory} required>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Food & Dining">Food & Dining</SelectItem>
                  <SelectItem value="Housing">Housing</SelectItem>
                  <SelectItem value="Transportation">Transportation</SelectItem>
                  <SelectItem value="Shopping">Shopping</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mb-4">
              <Label htmlFor="amount" className="block text-textDark font-medium mb-2">Monthly Budget Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textGray">$</span>
                <Input 
                  type="number" 
                  id="amount" 
                  className="w-full pl-8 py-3" 
                  placeholder="0.00"
                  value={newBudgetAmount}
                  onChange={(e) => setNewBudgetAmount(e.target.value)}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full bg-primary text-white py-3 font-medium mt-2">
              Add Budget
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Budgets;
