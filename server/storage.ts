import { 
  User, InsertUser, 
  Transaction, InsertTransaction, 
  Budget, InsertBudget,
  Goal, InsertGoal
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transaction operations
  getAllTransactions(): Promise<Transaction[]>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  getTransactionsByType(type: 'income' | 'expense'): Promise<Transaction[]>;
  getTransactionsByUserAndType(userId: number, type: 'income' | 'expense'): Promise<Transaction[]>;
  getTransactionsByCategory(category: string): Promise<Transaction[]>;
  getTransactionsByUserAndCategory(userId: number, category: string): Promise<Transaction[]>;
  addTransaction(transaction: InsertTransaction & { userId: number }): Promise<Transaction>;
  
  // Budget operations
  getAllBudgets(): Promise<Budget[]>;
  getBudgetsByUserId(userId: number): Promise<Budget[]>;
  getBudgetByCategory(category: string): Promise<Budget | undefined>;
  getBudgetByUserAndCategory(userId: number, category: string): Promise<Budget | undefined>;
  addBudget(budget: InsertBudget & { spent: number, userId: number }): Promise<Budget>;
  updateBudgetSpent(id: number, spent: number): Promise<Budget | undefined>;
  
  // Goal operations
  getAllGoals(): Promise<Goal[]>;
  getGoalsByUserId(userId: number): Promise<Goal[]>;
  getGoalById(id: number): Promise<Goal | undefined>;
  addGoal(goal: InsertGoal & { userId: number }): Promise<Goal>;
  updateGoalProgress(id: number, currentAmount: number): Promise<Goal | undefined>;
  updateGoalCompletion(id: number, isCompleted: boolean): Promise<Goal | undefined>;
  deleteGoal(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private budgets: Map<number, Budget>;
  private goals: Map<number, Goal>;
  private userId: number;
  private transactionId: number;
  private budgetId: number;
  private goalId: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.budgets = new Map();
    this.goals = new Map();
    this.userId = 1;
    this.transactionId = 1;
    this.budgetId = 1;
    this.goalId = 1;
    
    // Initialize with default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Add default users
    this.users.set(1, {
      id: 1,
      username: 'demo',
      password: 'demo123'
    });
    
    this.users.set(2, {
      id: 2,
      username: 'alice',
      password: 'password123'
    });
    
    this.users.set(3, {
      id: 3,
      username: 'bob',
      password: 'password123'
    });
    
    // Set the next user ID
    this.userId = 4;
    
    // Add some default transactions
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const twoDaysAgo = new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0];
    const threeDaysAgo = new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0];
    
    this.addTransaction({
      type: 'expense',
      amount: 65.40,
      category: 'Food & Dining',
      description: 'Grocery Store',
      date: today,
      userId: 1
    });
    
    this.addTransaction({
      type: 'income',
      amount: 2250.00,
      category: 'Income',
      description: 'Salary Deposit',
      date: today,
      userId: 1
    });
    
    this.addTransaction({
      type: 'expense',
      amount: 45.82,
      category: 'Transportation',
      description: 'Gas Station',
      date: yesterday,
      userId: 1
    });
    
    this.addTransaction({
      type: 'expense',
      amount: 128.75,
      category: 'Shopping',
      description: 'Department Store',
      date: twoDaysAgo,
      userId: 1
    });
    
    this.addTransaction({
      type: 'expense',
      amount: 1250.00,
      category: 'Housing',
      description: 'Rent Payment',
      date: threeDaysAgo,
      userId: 1
    });
    
    // Add some default budgets for demo user
    this.addBudget({
      category: 'Food & Dining',
      amount: 500,
      spent: 420,
      userId: 1
    });
    
    this.addBudget({
      category: 'Housing',
      amount: 1300,
      spent: 1250,
      userId: 1
    });
    
    this.addBudget({
      category: 'Transportation',
      amount: 350,
      spent: 210,
      userId: 1
    });
    
    this.addBudget({
      category: 'Shopping',
      amount: 300,
      spent: 380,
      userId: 1
    });
    
    // Add some data for Alice (User 2)
    this.addTransaction({
      type: 'income',
      amount: 3200.00,
      category: 'Income',
      description: 'Monthly Salary',
      date: today,
      userId: 2
    });
    
    this.addTransaction({
      type: 'expense',
      amount: 1500.00,
      category: 'Housing',
      description: 'Rent',
      date: yesterday,
      userId: 2
    });
    
    this.addTransaction({
      type: 'expense',
      amount: 85.75,
      category: 'Food & Dining',
      description: 'Restaurant',
      date: twoDaysAgo,
      userId: 2
    });
    
    // Add budgets for Alice
    this.addBudget({
      category: 'Food & Dining',
      amount: 600,
      spent: 85.75,
      userId: 2
    });
    
    this.addBudget({
      category: 'Housing',
      amount: 1500,
      spent: 1500,
      userId: 2
    });
    
    // Add some data for Bob (User 3)
    this.addTransaction({
      type: 'income',
      amount: 2800.00,
      category: 'Income',
      description: 'Salary',
      date: today,
      userId: 3
    });
    
    this.addTransaction({
      type: 'expense',
      amount: 950.00,
      category: 'Housing',
      description: 'Rent',
      date: yesterday,
      userId: 3
    });
    
    this.addTransaction({
      type: 'expense',
      amount: 120.50,
      category: 'Entertainment',
      description: 'Movie and dinner',
      date: yesterday,
      userId: 3
    });
    
    // Add budgets for Bob
    this.addBudget({
      category: 'Housing',
      amount: 1000,
      spent: 950,
      userId: 3
    });
    
    this.addBudget({
      category: 'Entertainment',
      amount: 200,
      spent: 120.50,
      userId: 3
    });
    
    // Add some default goals for users
    // Demo user goals
    this.addGoal({
      name: 'Emergency Fund',
      targetAmount: 5000,
      currentAmount: 2500,
      deadline: new Date(Date.now() + 86400000 * 90).toISOString(), // 90 days from now
      category: 'Savings',
      note: 'Build up 3 months of expenses for emergencies',
      userId: 1
    });
    
    this.addGoal({
      name: 'Summer Vacation',
      targetAmount: 1200,
      currentAmount: 350,
      deadline: new Date(Date.now() + 86400000 * 180).toISOString(), // 180 days from now
      category: 'Travel',
      note: 'Beach trip in July',
      userId: 1
    });
    
    // Alice goals
    this.addGoal({
      name: 'New Laptop',
      targetAmount: 1500,
      currentAmount: 750,
      deadline: new Date(Date.now() + 86400000 * 60).toISOString(), // 60 days from now
      category: 'Electronics',
      note: 'For freelance work',
      userId: 2
    });
    
    // Bob goals
    this.addGoal({
      name: 'Car Down Payment',
      targetAmount: 4000,
      currentAmount: 1500,
      deadline: new Date(Date.now() + 86400000 * 120).toISOString(), // 120 days from now
      category: 'Transportation',
      note: 'Saving for a new car',
      userId: 3
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Transaction operations
  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }
  
  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId
    );
  }
  
  async getTransactionsByType(type: 'income' | 'expense'): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.type === type
    );
  }
  
  async getTransactionsByUserAndType(userId: number, type: 'income' | 'expense'): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId && transaction.type === type
    );
  }
  
  async getTransactionsByCategory(category: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.category === category
    );
  }
  
  async getTransactionsByUserAndCategory(userId: number, category: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId && transaction.category === category
    );
  }
  
  async addTransaction(transaction: InsertTransaction & { userId: number }): Promise<Transaction> {
    const id = this.transactionId++;
    const description = transaction.description || "";
    const newTransaction: Transaction = { 
      ...transaction, 
      id,
      description 
    };
    this.transactions.set(id, newTransaction);
    
    // Update budget spent if it's an expense
    if (transaction.type === 'expense') {
      const budget = Array.from(this.budgets.values()).find(
        (budget) => budget.userId === transaction.userId && budget.category === transaction.category
      );
      
      if (budget && budget.spent !== null) {
        await this.updateBudgetSpent(budget.id, budget.spent + transaction.amount);
      }
    }
    
    return newTransaction;
  }
  
  // Budget operations
  async getAllBudgets(): Promise<Budget[]> {
    return Array.from(this.budgets.values());
  }
  
  async getBudgetsByUserId(userId: number): Promise<Budget[]> {
    return Array.from(this.budgets.values()).filter(
      (budget) => budget.userId === userId
    );
  }
  
  async getBudgetByCategory(category: string): Promise<Budget | undefined> {
    return Array.from(this.budgets.values()).find(
      (budget) => budget.category === category
    );
  }
  
  async getBudgetByUserAndCategory(userId: number, category: string): Promise<Budget | undefined> {
    return Array.from(this.budgets.values()).find(
      (budget) => budget.userId === userId && budget.category === category
    );
  }
  
  async addBudget(budget: InsertBudget & { spent: number, userId: number }): Promise<Budget> {
    const id = this.budgetId++;
    const newBudget: Budget = { ...budget, id };
    this.budgets.set(id, newBudget);
    return newBudget;
  }
  
  async updateBudgetSpent(id: number, spent: number): Promise<Budget | undefined> {
    const budget = this.budgets.get(id);
    
    if (!budget) {
      return undefined;
    }
    
    const updatedBudget: Budget = { ...budget, spent };
    this.budgets.set(id, updatedBudget);
    return updatedBudget;
  }

  // Goal operations
  async getAllGoals(): Promise<Goal[]> {
    return Array.from(this.goals.values());
  }

  async getGoalsByUserId(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(
      (goal) => goal.userId === userId
    );
  }

  async getGoalById(id: number): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async addGoal(goal: InsertGoal & { userId: number }): Promise<Goal> {
    const id = this.goalId++;
    const isCompleted = false;
    const currentAmount = goal.currentAmount || 0;
    const note = goal.note || "";
    
    const newGoal: Goal = {
      ...goal,
      id,
      isCompleted,
      currentAmount,
      note
    };
    
    this.goals.set(id, newGoal);
    return newGoal;
  }

  async updateGoalProgress(id: number, currentAmount: number): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    
    if (!goal) {
      return undefined;
    }
    
    // Automatically update isCompleted status if target is met
    const isCompleted = currentAmount >= goal.targetAmount;
    
    const updatedGoal: Goal = { 
      ...goal, 
      currentAmount, 
      isCompleted 
    };
    
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async updateGoalCompletion(id: number, isCompleted: boolean): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    
    if (!goal) {
      return undefined;
    }
    
    const updatedGoal: Goal = { ...goal, isCompleted };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<boolean> {
    return this.goals.delete(id);
  }
}

export const storage = new MemStorage();
