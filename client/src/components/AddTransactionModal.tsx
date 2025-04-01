import { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addTransaction } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {useAuth} from '@/lib/auth';
import {useLocation} from 'wouter';

interface AddTransactionModalProps {
  onClose: () => void;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [transactionType, setTransactionType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to add transactions.',
        variant: 'destructive'
      });
      onClose();
      setLocation('/login');
    }
  }, [user]);

  if (!user) return null;
  
  // Create a mutation for adding transactions
  const addTransactionMutation = useMutation({
    mutationFn: async (transactionData: any) => {
      return await addTransaction(transactionData);
    },
    onSuccess: () => {
      // Invalidate and refetch queries that depend on transaction data
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-data'] });

      toast({
        title: 'Transaction added',
        description: 'Your transaction has been successfully recorded.',
        variant: 'success'
      });

      // Close the modal
      onClose();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add transaction. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount greater than zero.',
        variant: 'destructive'
      });
      return;
    }

    if (!category) {
      toast({
        title: 'Category required',
        description: 'Please select a category for this transaction.',
        variant: 'destructive'
      });
      return;
    }

    // Execute the mutation
    addTransactionMutation.mutate({
      type: transactionType,
      amount: parseFloat(amount),
      category,
      description,
      date
    });
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add Transaction</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <Label className="block text-textDark font-medium mb-2">Transaction Type</Label>
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant={transactionType === 'expense' ? 'default' : 'outline'}
              className={`py-3 font-medium flex justify-center items-center ${
                transactionType === 'expense' ? 'bg-primary' : 'border-borderGray'
              }`}
              onClick={() => setTransactionType('expense')}
            >
              <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              Expense
            </Button>
            <Button
              type="button"
              variant={transactionType === 'income' ? 'default' : 'outline'}
              className={`py-3 font-medium flex justify-center items-center ${
                transactionType === 'income' ? 'bg-primary' : 'border-borderGray'
              }`}
              onClick={() => setTransactionType('income')}
            >
              <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Income
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <Label htmlFor="amount" className="block text-textDark font-medium mb-2">Amount</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textGray">$</span>
            <Input 
              type="number" 
              id="amount" 
              className="w-full pl-8 py-3" 
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <Label htmlFor="category" className="block text-textDark font-medium mb-2">Category</Label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger className="w-full">
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
              <SelectItem value="Income">Income</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-4">
          <Label htmlFor="description" className="block text-textDark font-medium mb-2">Description</Label>
          <Input 
            type="text" 
            id="description" 
            className="w-full py-3" 
            placeholder="What was this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="date" className="block text-textDark font-medium mb-2">Date</Label>
          <Input 
            type="date" 
            id="date" 
            className="w-full py-3"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full bg-primary text-white py-3 font-medium mt-2">
          Add Transaction
        </Button>
      </form>
    </DialogContent>
  );
};

export default AddTransactionModal;