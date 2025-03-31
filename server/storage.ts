import { 
  User, InsertUser, 
  Transaction, InsertTransaction, 
  Budget, InsertBudget 
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transaction operations
  getAllTransactions(): Promise<Transaction[]>;
  getTransactionsByType(type: 'income' | 'expense'): Promise<Transaction[]>;
  getTransactionsByCategory(category: string): Promise<Transaction[]>;
  addTransaction(transaction: InsertTransaction & { userId: number }): Promise<Transaction>;
  
  // Budget operations
  getAllBudgets(): Promise<Budget[]>;
  getBudgetByCategory(category: string): Promise<Budget | undefined>;
  addBudget(budget: InsertBudget & { spent: number, userId: number }): Promise<Budget>;
  updateBudgetSpent(id: number, spent: number): Promise<Budget | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private budgets: Map<number, Budget>;
  private userId: number;
  private transactionId: number;
  private budgetId: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.budgets = new Map();
    this.userId = 1;
    this.transactionId = 1;
    this.budgetId = 1;
    
    // Initialize with default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Add a default user
    this.users.set(1, {
      id: 1,
      username: 'demo',
      password: 'demo123'
    });
    
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
    
    // Add some default budgets
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
  
  async getTransactionsByType(type: 'income' | 'expense'): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.type === type
    );
  }
  
  async getTransactionsByCategory(category: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.category === category
    );
  }
  
  async addTransaction(transaction: InsertTransaction & { userId: number }): Promise<Transaction> {
    const id = this.transactionId++;
    const newTransaction: Transaction = { ...transaction, id };
    this.transactions.set(id, newTransaction);
    
    // Update budget spent if it's an expense
    if (transaction.type === 'expense') {
      const budget = Array.from(this.budgets.values()).find(
        (budget) => budget.category === transaction.category
      );
      
      if (budget) {
        await this.updateBudgetSpent(budget.id, budget.spent + transaction.amount);
      }
    }
    
    return newTransaction;
  }
  
  // Budget operations
  async getAllBudgets(): Promise<Budget[]> {
    return Array.from(this.budgets.values());
  }
  
  async getBudgetByCategory(category: string): Promise<Budget | undefined> {
    return Array.from(this.budgets.values()).find(
      (budget) => budget.category === category
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
}

export const storage = new MemStorage();
