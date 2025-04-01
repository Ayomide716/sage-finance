import { Transaction, Budget, InsertTransaction, InsertBudget } from '@shared/schema';

// IndexedDB database configuration
const DB_NAME = 'fintrackDB';
const DB_VERSION = 1;
const TRANSACTION_STORE = 'transactions';
const BUDGET_STORE = 'budgets';

// Initialize the database
export const initDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // First check if we need to delete the existing database
    const checkRequest = indexedDB.open(DB_NAME);
    
    checkRequest.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const currentVersion = db.version;
      
      // Check if both stores exist
      const hasTransactionStore = db.objectStoreNames.contains(TRANSACTION_STORE);
      const hasBudgetStore = db.objectStoreNames.contains(BUDGET_STORE);
      
      db.close();
      
      // If stores are missing, delete the database and recreate it
      if (!hasTransactionStore || !hasBudgetStore) {
        console.log("Recreating database with all required stores");
        const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
        
        deleteRequest.onsuccess = () => {
          // Now create a fresh database
          createDatabase();
        };
        
        deleteRequest.onerror = (event) => {
          console.error("Error deleting database:", (event.target as IDBOpenDBRequest).error);
          reject((event.target as IDBOpenDBRequest).error);
        };
      } else {
        // Database is fine, just resolve
        resolve();
      }
    };
    
    checkRequest.onerror = (event) => {
      // Error checking database, try to create it
      console.error("Error checking database:", (event.target as IDBOpenDBRequest).error);
      createDatabase();
    };
    
    // Function to create the database with all required stores
    function createDatabase() {
      // Open the database with a specific version
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      // Create object stores when needed
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create transaction store with auto-incrementing id
        if (!db.objectStoreNames.contains(TRANSACTION_STORE)) {
          console.log("Creating transaction store");
          const transactionStore = db.createObjectStore(TRANSACTION_STORE, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          transactionStore.createIndex('date', 'date', { unique: false });
          transactionStore.createIndex('type', 'type', { unique: false });
          transactionStore.createIndex('category', 'category', { unique: false });
        }

        // Create budget store with auto-incrementing id
        if (!db.objectStoreNames.contains(BUDGET_STORE)) {
          console.log("Creating budget store");
          const budgetStore = db.createObjectStore(BUDGET_STORE, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          budgetStore.createIndex('category', 'category', { unique: true });
        }
      };

      request.onsuccess = (event) => {
        console.log("Database initialized successfully");
        resolve();
      };

      request.onerror = (event) => {
        console.error("Error initializing database:", (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    }
  });
};

// Get all transactions
export const getTransactions = async (): Promise<{ transactions: Transaction[] }> => {
  try {
    // Get user from localStorage
    const userString = localStorage.getItem('financeUser');
    if (!userString) {
      return { transactions: [] };
    }
    
    const user = JSON.parse(userString);
    
    // Use the API to get transactions for this user
    const response = await fetch(`/api/transactions?userId=${user.id}`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch transactions: ${response.status} ${response.statusText}`);
      return { transactions: [] };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting transactions:', error);
    return { transactions: [] };
  }
};

// Add a new transaction
export const addTransaction = async (newTransaction: InsertTransaction): Promise<Transaction> => {
  try {
    // Get user from localStorage
    const userString = localStorage.getItem('financeUser');
    if (!userString) {
      throw new Error('User not authenticated');
    }
    
    const user = JSON.parse(userString);
    
    // Use the API to add the transaction
    console.log('Adding transaction:', { ...newTransaction, userId: user.id });
    const response = await fetch('/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...newTransaction,
        userId: user.id
      }),
      credentials: 'include'
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Server response:', errorData);
      console.error('Response headers:', Object.fromEntries(response.headers.entries()));
      throw new Error(errorData.message || `Failed to add transaction: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

// Get all budgets with spent amounts
export const getBudgets = async (): Promise<{ budgets: Budget[] }> => {
  try {
    // Get user from localStorage
    const userString = localStorage.getItem('financeUser');
    if (!userString) {
      return { budgets: [] };
    }
    
    const user = JSON.parse(userString);
    
    // Use the API to get budgets for this user
    const response = await fetch(`/api/budgets?userId=${user.id}`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch budgets: ${response.status} ${response.statusText}`);
      return { budgets: [] };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting budgets:', error);
    return { budgets: [] };
  }
};

// Add a new budget
export const addBudget = async (newBudget: InsertBudget): Promise<Budget> => {
  try {
    // Get user from localStorage
    const userString = localStorage.getItem('financeUser');
    if (!userString) {
      throw new Error('User not authenticated');
    }
    
    const user = JSON.parse(userString);
    
    // Use the API to add the budget
    const response = await fetch('/api/budgets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...newBudget,
        userId: user.id
      }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to add budget: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding budget:', error);
    throw error;
  }
};

// Get all financial data (transactions and budgets) for reporting
export const getFinancialData = async (): Promise<{ transactions: Transaction[], budgets: Budget[], user?: { id: number, username: string } }> => {
  try {
    // Get user from localStorage
    const userString = localStorage.getItem('financeUser');
    if (!userString) {
      return { transactions: [], budgets: [] };
    }
    
    const user = JSON.parse(userString);
    
    // Use the API to get all financial data for this user
    const response = await fetch(`/api/finance/data?userId=${user.id}`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch financial data: ${response.status} ${response.statusText}`);
      return { transactions: [], budgets: [] };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting financial data:', error);
    return { transactions: [], budgets: [] };
  }
};

// Helper function to update a budget's spent amount when adding a transaction
const updateBudgetSpent = (
  db: IDBDatabase, 
  transaction: IDBTransaction, 
  category: string, 
  amount: number
): void => {
  const budgetStore = transaction.objectStore(BUDGET_STORE);
  const categoryIndex = budgetStore.index('category');
  const getRequest = categoryIndex.get(category);
  
  getRequest.onsuccess = () => {
    const budget = getRequest.result;
    if (budget) {
      // Only update if we found a matching budget
      const currentDate = new Date();
      const transactionMonth = currentDate.getMonth();
      const transactionYear = currentDate.getFullYear();
      
      // Only update if the transaction is in the current month
      if (
        (budget.month === undefined || budget.month === transactionMonth) && 
        (budget.year === undefined || budget.year === transactionYear)
      ) {
        // Update the spent amount
        budget.spent = (budget.spent || 0) + amount;
        
        // Put the updated budget back
        budgetStore.put(budget);
      }
    }
  };
};
