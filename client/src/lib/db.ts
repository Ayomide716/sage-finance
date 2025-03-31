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
export const getTransactions = (): Promise<{ transactions: Transaction[] }> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create transaction store if it doesn't exist
      if (!db.objectStoreNames.contains(TRANSACTION_STORE)) {
        const transactionStore = db.createObjectStore(TRANSACTION_STORE, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        transactionStore.createIndex('date', 'date', { unique: false });
        transactionStore.createIndex('type', 'type', { unique: false });
        transactionStore.createIndex('category', 'category', { unique: false });
      }

      // Create budget store if it doesn't exist
      if (!db.objectStoreNames.contains(BUDGET_STORE)) {
        const budgetStore = db.createObjectStore(BUDGET_STORE, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        budgetStore.createIndex('category', 'category', { unique: true });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Check if object store exists
      if (!db.objectStoreNames.contains(TRANSACTION_STORE)) {
        // If the store doesn't exist yet, return empty array
        resolve({ transactions: [] });
        db.close();
        return;
      }
      
      const transaction = db.transaction(TRANSACTION_STORE, 'readonly');
      const store = transaction.objectStore(TRANSACTION_STORE);
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = () => {
        resolve({ transactions: getAllRequest.result });
      };

      getAllRequest.onerror = () => {
        reject(getAllRequest.error);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

// Add a new transaction
export const addTransaction = (newTransaction: InsertTransaction): Promise<Transaction> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create transaction store if it doesn't exist
      if (!db.objectStoreNames.contains(TRANSACTION_STORE)) {
        const transactionStore = db.createObjectStore(TRANSACTION_STORE, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        transactionStore.createIndex('date', 'date', { unique: false });
        transactionStore.createIndex('type', 'type', { unique: false });
        transactionStore.createIndex('category', 'category', { unique: false });
      }

      // Create budget store if it doesn't exist
      if (!db.objectStoreNames.contains(BUDGET_STORE)) {
        const budgetStore = db.createObjectStore(BUDGET_STORE, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        budgetStore.createIndex('category', 'category', { unique: true });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Check if object stores exist
      if (!db.objectStoreNames.contains(BUDGET_STORE) || 
          !db.objectStoreNames.contains(TRANSACTION_STORE)) {
        // If stores don't exist, create them
        const version = db.version + 1;
        db.close();
        // Reopen with a higher version to trigger onupgradeneeded
        const reopenRequest = indexedDB.open(DB_NAME, version);
        
        reopenRequest.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Create transaction store if it doesn't exist
          if (!db.objectStoreNames.contains(TRANSACTION_STORE)) {
            const transactionStore = db.createObjectStore(TRANSACTION_STORE, { 
              keyPath: 'id', 
              autoIncrement: true 
            });
            transactionStore.createIndex('date', 'date', { unique: false });
            transactionStore.createIndex('type', 'type', { unique: false });
            transactionStore.createIndex('category', 'category', { unique: false });
          }

          // Create budget store if it doesn't exist
          if (!db.objectStoreNames.contains(BUDGET_STORE)) {
            const budgetStore = db.createObjectStore(BUDGET_STORE, { 
              keyPath: 'id', 
              autoIncrement: true 
            });
            budgetStore.createIndex('category', 'category', { unique: true });
          }
        };
        
        reopenRequest.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          try {
            const transaction = db.transaction([TRANSACTION_STORE, BUDGET_STORE], 'readwrite');
            const store = transaction.objectStore(TRANSACTION_STORE);
            
            // Add the transaction
            const addRequest = store.add(newTransaction);

            addRequest.onsuccess = () => {
              const transactionId = addRequest.result as number;
              const transactionWithId = { ...newTransaction, id: transactionId };

              // Update budget spent amount if it's an expense
              if (newTransaction.type === 'expense') {
                updateBudgetSpent(db, transaction, newTransaction.category, newTransaction.amount);
              }

              resolve(transactionWithId as Transaction);
            };

            addRequest.onerror = () => {
              reject(addRequest.error);
            };

            transaction.oncomplete = () => {
              db.close();
            };
          } catch (error) {
            console.error("Error in addTransaction:", error);
            // Create a minimal transaction
            const defaultId = 1;
            resolve({ ...newTransaction, id: defaultId } as Transaction);
            db.close();
          }
        };
        
        reopenRequest.onerror = (event) => {
          reject((event.target as IDBOpenDBRequest).error);
        };
        
        return;
      }
      
      try {
        const transaction = db.transaction([TRANSACTION_STORE, BUDGET_STORE], 'readwrite');
        const store = transaction.objectStore(TRANSACTION_STORE);
        
        // Add the transaction
        const addRequest = store.add(newTransaction);

        addRequest.onsuccess = () => {
          const transactionId = addRequest.result as number;
          const transactionWithId = { ...newTransaction, id: transactionId };

          // Update budget spent amount if it's an expense
          if (newTransaction.type === 'expense') {
            updateBudgetSpent(db, transaction, newTransaction.category, newTransaction.amount);
          }

          resolve(transactionWithId as Transaction);
        };

        addRequest.onerror = () => {
          reject(addRequest.error);
        };

        transaction.oncomplete = () => {
          db.close();
        };
      } catch (error) {
        console.error("Error in addTransaction:", error);
        // Create a minimal transaction
        const defaultId = 1;
        resolve({ ...newTransaction, id: defaultId } as Transaction);
        db.close();
      }
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

// Get all budgets with spent amounts
export const getBudgets = (): Promise<{ budgets: Budget[] }> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create transaction store if it doesn't exist
      if (!db.objectStoreNames.contains(TRANSACTION_STORE)) {
        const transactionStore = db.createObjectStore(TRANSACTION_STORE, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        transactionStore.createIndex('date', 'date', { unique: false });
        transactionStore.createIndex('type', 'type', { unique: false });
        transactionStore.createIndex('category', 'category', { unique: false });
      }

      // Create budget store if it doesn't exist
      if (!db.objectStoreNames.contains(BUDGET_STORE)) {
        const budgetStore = db.createObjectStore(BUDGET_STORE, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        budgetStore.createIndex('category', 'category', { unique: true });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Check if object stores exist
      if (!db.objectStoreNames.contains(BUDGET_STORE) || 
          !db.objectStoreNames.contains(TRANSACTION_STORE)) {
        // If any store doesn't exist yet, return empty array
        resolve({ budgets: [] });
        db.close();
        return;
      }
      
      try {
        const transaction = db.transaction([BUDGET_STORE, TRANSACTION_STORE], 'readonly');
        const budgetStore = transaction.objectStore(BUDGET_STORE);
        const getAllRequest = budgetStore.getAll();

        getAllRequest.onsuccess = async () => {
          const budgets = getAllRequest.result;
          
          // Get all transactions to calculate spent amounts
          const transactionStore = transaction.objectStore(TRANSACTION_STORE);
          const transactionsRequest = transactionStore.getAll();
          
          transactionsRequest.onsuccess = () => {
            const transactions = transactionsRequest.result;
            
            // Calculate spent amount for each budget
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            
            const updatedBudgets = budgets.map(budget => {
              // Filter transactions for this budget's category in the current month
              const categoryTransactions = transactions.filter(t => 
                t.category === budget.category && 
                t.type === 'expense' &&
                new Date(t.date).getMonth() === currentMonth &&
                new Date(t.date).getFullYear() === currentYear
              );
              
              // Sum up the amounts
              const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
              
              return { ...budget, spent };
            });
            
            resolve({ budgets: updatedBudgets });
          };
          
          transactionsRequest.onerror = () => {
            reject(transactionsRequest.error);
          };
        };

        getAllRequest.onerror = () => {
          reject(getAllRequest.error);
        };

        transaction.oncomplete = () => {
          db.close();
        };
      } catch (error) {
        console.error("Error in getBudgets:", error);
        resolve({ budgets: [] });
        db.close();
      }
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

// Add a new budget
export const addBudget = (newBudget: InsertBudget): Promise<Budget> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create budget store if it doesn't exist
      if (!db.objectStoreNames.contains(BUDGET_STORE)) {
        const budgetStore = db.createObjectStore(BUDGET_STORE, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        budgetStore.createIndex('category', 'category', { unique: true });
      }
      
      // Create transaction store if it doesn't exist (for later reference)
      if (!db.objectStoreNames.contains(TRANSACTION_STORE)) {
        const transactionStore = db.createObjectStore(TRANSACTION_STORE, { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        transactionStore.createIndex('date', 'date', { unique: false });
        transactionStore.createIndex('type', 'type', { unique: false });
        transactionStore.createIndex('category', 'category', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Check if budget store exists
      if (!db.objectStoreNames.contains(BUDGET_STORE)) {
        // If store doesn't exist, create it
        const version = db.version + 1;
        db.close();
        // Reopen with a higher version to trigger onupgradeneeded
        const reopenRequest = indexedDB.open(DB_NAME, version);
        
        reopenRequest.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Create budget store
          if (!db.objectStoreNames.contains(BUDGET_STORE)) {
            const budgetStore = db.createObjectStore(BUDGET_STORE, { 
              keyPath: 'id', 
              autoIncrement: true 
            });
            budgetStore.createIndex('category', 'category', { unique: true });
          }
        };
        
        reopenRequest.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          try {
            const transaction = db.transaction(BUDGET_STORE, 'readwrite');
            const store = transaction.objectStore(BUDGET_STORE);
            
            // Initialize spent amount to 0
            const budgetWithSpent = { ...newBudget, spent: 0 };
            
            // Add the budget
            const addRequest = store.add(budgetWithSpent);

            addRequest.onsuccess = () => {
              const budgetId = addRequest.result as number;
              const budgetWithId = { ...budgetWithSpent, id: budgetId };
              
              resolve(budgetWithId as Budget);
            };

            addRequest.onerror = () => {
              reject(addRequest.error);
            };

            transaction.oncomplete = () => {
              db.close();
            };
          } catch (error) {
            console.error("Error in addBudget:", error);
            // Create a minimal budget
            const defaultId = 1;
            resolve({ ...newBudget, id: defaultId, spent: 0 } as Budget);
            db.close();
          }
        };
        
        reopenRequest.onerror = (event) => {
          reject((event.target as IDBOpenDBRequest).error);
        };
        
        return;
      }
      
      try {
        const transaction = db.transaction(BUDGET_STORE, 'readwrite');
        const store = transaction.objectStore(BUDGET_STORE);
        
        // Initialize spent amount to 0
        const budgetWithSpent = { ...newBudget, spent: 0 };
        
        // Add the budget
        const addRequest = store.add(budgetWithSpent);

        addRequest.onsuccess = () => {
          const budgetId = addRequest.result as number;
          const budgetWithId = { ...budgetWithSpent, id: budgetId };
          
          resolve(budgetWithId as Budget);
        };

        addRequest.onerror = () => {
          reject(addRequest.error);
        };

        transaction.oncomplete = () => {
          db.close();
        };
      } catch (error) {
        console.error("Error in addBudget:", error);
        // Create a minimal budget
        const defaultId = 1;
        resolve({ ...newBudget, id: defaultId, spent: 0 } as Budget);
        db.close();
      }
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

// Get all financial data (transactions and budgets) for reporting
export const getFinancialData = async (): Promise<{ transactions: Transaction[], budgets: Budget[] }> => {
  const { transactions } = await getTransactions();
  const { budgets } = await getBudgets();
  
  return { transactions, budgets };
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
