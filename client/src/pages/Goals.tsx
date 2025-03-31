import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format, parseISO, isAfter } from 'date-fns';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { apiRequest } from '@/lib/queryClient';
import { Goal } from '@shared/schema';
import { AlertTriangle, CheckCircle, Plus, Trash2, Edit, Calendar, Slash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Goal categories for the dropdown
const goalCategories = [
  'Savings',
  'Retirement',
  'Education',
  'Home',
  'Car',
  'Travel',
  'Wedding',
  'Emergency Fund',
  'Electronics',
  'Debt Payoff',
  'Other'
];

// Schema for adding/editing a goal
const goalFormSchema = z.object({
  name: z.string().min(2, { message: "Goal name must be at least 2 characters" }),
  targetAmount: z.coerce.number().positive({ message: "Target amount must be greater than 0" }),
  currentAmount: z.coerce.number().min(0, { message: "Current amount cannot be negative" }),
  deadline: z.string()
    .refine(value => {
      try {
        const date = parseISO(value);
        return !isNaN(date.getTime());
      } catch {
        return false;
      }
    }, { message: "Please enter a valid date" }),
  category: z.string().min(1, { message: "Category is required" }),
  note: z.string().optional()
});

export default function Goals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  
  // Query for fetching goals
  const { 
    data: goalsData, 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['/api/goals'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/goals?userId=${user?.id}`);
      const data = await res.json();
      return data as { goals: Goal[] };
    },
    enabled: !!user
  });
  
  // Form for adding a new goal
  const addGoalForm = useForm<z.infer<typeof goalFormSchema>>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      deadline: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0], // 30 days from now
      category: 'Savings',
      note: ''
    }
  });
  
  // Form for updating goal progress
  const updateProgressForm = useForm<{ currentAmount: number }>({
    defaultValues: {
      currentAmount: selectedGoal?.currentAmount || 0
    }
  });
  
  // Reset update form when selected goal changes
  React.useEffect(() => {
    if (selectedGoal) {
      updateProgressForm.reset({
        currentAmount: selectedGoal.currentAmount || 0
      });
    }
  }, [selectedGoal, updateProgressForm]);
  
  // Mutation for adding a new goal
  const addGoalMutation = useMutation({
    mutationFn: (goalData: z.infer<typeof goalFormSchema>) => 
      apiRequest('POST', '/api/goals', {
        ...goalData,
        userId: user?.id
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/finance/data'] });
      setIsAddGoalOpen(false);
      addGoalForm.reset();
      toast({
        title: "Goal Added",
        description: "Your financial goal has been added successfully!",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add goal. Please try again.",
        variant: "destructive"
      });
      console.error("Failed to add goal:", error);
    }
  });
  
  // Mutation for updating goal progress
  const updateGoalProgressMutation = useMutation({
    mutationFn: ({ id, amount }: { id: number, amount: number }) => 
      apiRequest('PATCH', `/api/goals/${id}/progress`, {
        currentAmount: amount,
        userId: user?.id
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/finance/data'] });
      setIsUpdateDialogOpen(false);
      setSelectedGoal(null);
      toast({
        title: "Progress Updated",
        description: "Your goal progress has been updated successfully!",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update goal progress. Please try again.",
        variant: "destructive"
      });
      console.error("Failed to update goal progress:", error);
    }
  });
  
  // Mutation for deleting a goal
  const deleteGoalMutation = useMutation({
    mutationFn: (goalId: number) => 
      apiRequest('DELETE', `/api/goals/${goalId}?userId=${user?.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/finance/data'] });
      toast({
        title: "Goal Deleted",
        description: "Your financial goal has been deleted successfully!",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete goal. Please try again.",
        variant: "destructive"
      });
      console.error("Failed to delete goal:", error);
    }
  });
  
  // Mutation for marking a goal as complete or reopening it
  const completeGoalMutation = useMutation({
    mutationFn: ({ goalId, isCompleted }: { goalId: number, isCompleted: boolean }) => 
      apiRequest('PATCH', `/api/goals/${goalId}/complete`, {
        isCompleted,
        userId: user?.id
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/finance/data'] });
      setIsUpdateDialogOpen(false);
      setSelectedGoal(null);
      toast({
        title: variables.isCompleted ? "Goal Completed" : "Goal Reopened",
        description: variables.isCompleted 
          ? "Congratulations! Your financial goal has been marked as complete!" 
          : "Your goal has been reopened for tracking.",
        variant: "default"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update goal status. Please try again.",
        variant: "destructive"
      });
      console.error("Failed to update goal status:", error);
    }
  });
  
  const handleAddGoalSubmit = (values: z.infer<typeof goalFormSchema>) => {
    addGoalMutation.mutate(values);
  };
  
  const handleUpdateProgress = (values: { currentAmount: number }) => {
    if (selectedGoal) {
      updateGoalProgressMutation.mutate({
        id: selectedGoal.id,
        amount: values.currentAmount
      });
    }
  };
  
  const handleDeleteGoal = (goalId: number) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      deleteGoalMutation.mutate(goalId);
    }
  };
  
  // Function to calculate the progress percentage
  const calculateProgress = (current: number | null, target: number | null): number => {
    const safeTarget = target || 0;
    const safeCurrent = current || 0;
    
    if (safeTarget === 0) return 0;
    const percentage = (safeCurrent / safeTarget) * 100;
    return percentage > 100 ? 100 : percentage;
  };
  
  // Function to determine if a goal is overdue
  const isGoalOverdue = (deadline: string, isCompleted: boolean | null): boolean => {
    if (isCompleted === true) return false;
    try {
      const deadlineDate = parseISO(deadline);
      return isAfter(new Date(), deadlineDate);
    } catch (e) {
      return false;
    }
  };
  
  // Function to format the date
  const formatDate = (dateString: string): string => {
    try {
      return format(parseISO(dateString), 'MMMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Financial Goals</h1>
        <p>Loading your goals...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Financial Goals</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error loading goals. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  const goals = goalsData?.goals || [];
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Financial Goals</h1>
        <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Financial Goal</DialogTitle>
              <DialogDescription>
                Create a new financial goal to track your savings progress
              </DialogDescription>
            </DialogHeader>
            
            <Form {...addGoalForm}>
              <form onSubmit={addGoalForm.handleSubmit(handleAddGoalSubmit)} className="space-y-4">
                <FormField
                  control={addGoalForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Emergency Fund" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addGoalForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {goalCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={addGoalForm.control}
                    name="targetAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="500.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addGoalForm.control}
                    name="currentAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Amount</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={addGoalForm.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addGoalForm.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add some notes about your goal..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddGoalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addGoalMutation.isPending}>
                    {addGoalMutation.isPending ? "Saving..." : "Save Goal"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {goals.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-background">
          <h3 className="text-xl font-medium mb-2">No Goals Yet</h3>
          <p className="text-muted-foreground mb-6">Start by creating your first financial goal</p>
          <Button onClick={() => setIsAddGoalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const overdue = isGoalOverdue(goal.deadline, goal.isCompleted);
            
            return (
              <Card key={goal.id} className={`overflow-hidden ${goal.isCompleted ? 'border-green-300' : overdue ? 'border-red-300' : ''}`}>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{goal.name}</CardTitle>
                      <CardDescription className="text-base">{goal.category}</CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          setSelectedGoal(goal);
                          setIsUpdateDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Progress:</span>
                    <span className="font-medium">{progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={progress} className="h-2 mb-4" />
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Current</p>
                      <p className="font-medium">${(goal.currentAmount || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Target</p>
                      <p className="font-medium">${(goal.targetAmount || 0).toFixed(2)}</p>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className={`text-sm ${overdue ? 'text-destructive' : ''}`}>
                        Due by {formatDate(goal.deadline)}
                      </span>
                    </div>
                  </div>
                  
                  {goal.note && <p className="text-sm text-muted-foreground italic">"{goal.note}"</p>}
                </CardContent>
                <CardFooter className="bg-muted/50 py-3 px-6">
                  {goal.isCompleted ? (
                    <div className="flex items-center text-green-600 w-full">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="font-medium">Goal Achieved!</span>
                    </div>
                  ) : overdue ? (
                    <div className="flex items-center text-destructive w-full">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span className="font-medium">Overdue</span>
                    </div>
                  ) : (
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSelectedGoal(goal);
                        setIsUpdateDialogOpen(true);
                      }}
                    >
                      Update Progress
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Dialog for updating progress */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Goal Progress</DialogTitle>
            <DialogDescription>
              Update your current progress for {selectedGoal?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedGoal && (
            <form onSubmit={updateProgressForm.handleSubmit(handleUpdateProgress)} className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Target Amount:</span>
                  <span className="font-medium">${(selectedGoal.targetAmount || 0).toFixed(2)}</span>
                </div>
                
                <label htmlFor="currentAmount" className="text-sm font-medium">
                  Current Amount
                </label>
                <Input
                  id="currentAmount"
                  type="number"
                  step="0.01"
                  value={updateProgressForm.watch('currentAmount')}
                  onChange={(e) => updateProgressForm.setValue('currentAmount', parseFloat(e.target.value))}
                />
                
                <div className="flex justify-between mt-4">
                  <span className="text-muted-foreground">Remaining:</span>
                  <span className="font-medium">
                    ${Math.max(0, (selectedGoal.targetAmount || 0) - updateProgressForm.watch('currentAmount')).toFixed(2)}
                  </span>
                </div>
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                {selectedGoal.isCompleted ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (selectedGoal) {
                        completeGoalMutation.mutate({
                          goalId: selectedGoal.id,
                          isCompleted: false
                        });
                      }
                    }}
                    className="flex items-center"
                  >
                    <Slash className="mr-2 h-4 w-4" />
                    Reopen Goal
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (selectedGoal) {
                        completeGoalMutation.mutate({
                          goalId: selectedGoal.id,
                          isCompleted: true
                        });
                      }
                    }}
                    className="flex items-center"
                    disabled={completeGoalMutation.isPending}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {completeGoalMutation.isPending ? "Marking..." : "Mark as Complete"}
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateGoalProgressMutation.isPending}
                >
                  {updateGoalProgressMutation.isPending ? "Updating..." : "Update Progress"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}