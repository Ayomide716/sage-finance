import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertBudgetSchema, insertUserSchema, insertGoalSchema } from "@shared/schema";

// Interface for authenticated request
interface AuthenticatedRequest extends Request {
  userId?: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // All API routes will be prefixed with /api
  
  // Authentication middleware
  const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // Check for userId in query params (for GET requests)
    // or in the request body (for POST/PUT/PATCH requests)
    const userId = req.query.userId || req.body.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const user = await storage.getUser(parseInt(userId as string));
    
    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    }
    
    req.userId = user.id;
    next();
  };
  
  // AUTHENTICATION
  
  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      res.status(200).json({ 
        user: { 
          id: user.id, 
          username: user.username 
        } 
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  // Register endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid user data",
          errors: result.error.errors 
        });
      }
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(result.data.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const newUser = await storage.createUser(result.data);
      
      res.status(201).json({ 
        user: { 
          id: newUser.id, 
          username: newUser.username 
        } 
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  
  // Get current user
  app.get("/api/auth/user", async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.query.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = await storage.getUser(parseInt(userId as string));
      
      if (!user) {
        return res.status(401).json({ message: "Invalid user" });
      }
      
      res.status(200).json({ 
        user: { 
          id: user.id, 
          username: user.username 
        } 
      });
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  // TRANSACTIONS
  
  // Get all transactions
  app.get("/api/transactions", async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }

      const userIdNumber = parseInt(userId);
      const transactions = await storage.getTransactionsByUserId(userIdNumber);
      res.status(200).json({ transactions });
    } catch (error) {
      console.error("Error getting transactions:", error);
      res.status(500).json({ message: "Failed to retrieve transactions" });
    }
  });
  
  // Add a new transaction
  app.post("/api/transactions", async (req: AuthenticatedRequest, res) => {
    try {
      const { userId, ...transactionData } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }
      
      const result = insertTransactionSchema.safeParse(transactionData);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid transaction data",
          errors: result.error.errors 
        });
      }
      
      const newTransaction = await storage.addTransaction({
        ...result.data,
        userId: parseInt(userId)
      });
      
      res.status(201).json(newTransaction);
    } catch (error) {
      console.error("Error adding transaction:", error);
      res.status(500).json({ message: "Failed to add transaction" });
    }
  });

  // BUDGETS
  
  // Get all budgets
  app.get("/api/budgets", async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }

      const userIdNumber = parseInt(userId);
      const budgets = await storage.getBudgetsByUserId(userIdNumber);
      res.status(200).json({ budgets });
    } catch (error) {
      console.error("Error getting budgets:", error);
      res.status(500).json({ message: "Failed to retrieve budgets" });
    }
  });
  
  // Add a new budget
  app.post("/api/budgets", async (req: AuthenticatedRequest, res) => {
    try {
      const { userId, ...budgetData } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }
      
      const result = insertBudgetSchema.safeParse(budgetData);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid budget data",
          errors: result.error.errors 
        });
      }
      
      const newBudget = await storage.addBudget({
        ...result.data,
        userId: parseInt(userId),
        spent: 0
      });
      
      res.status(201).json(newBudget);
    } catch (error) {
      console.error("Error adding budget:", error);
      res.status(500).json({ message: "Failed to add budget" });
    }
  });
  
  // Update budget spent amount
  app.patch("/api/budgets/:id/spent", async (req: AuthenticatedRequest, res) => {
    try {
      const budgetId = parseInt(req.params.id);
      const { spent, userId } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }
      
      if (typeof spent !== 'number' || isNaN(spent) || spent < 0) {
        return res.status(400).json({ message: "Invalid spent amount" });
      }
      
      // Get the budget first to verify it belongs to the user
      const userIdNumber = parseInt(userId);
      const budgets = await storage.getBudgetsByUserId(userIdNumber);
      const budget = budgets.find(b => b.id === budgetId);
      
      if (!budget) {
        return res.status(404).json({ message: "Budget not found or not owned by user" });
      }
      
      const updatedBudget = await storage.updateBudgetSpent(budgetId, spent);
      
      res.status(200).json(updatedBudget);
    } catch (error) {
      console.error("Error updating budget spent:", error);
      res.status(500).json({ message: "Failed to update budget" });
    }
  });
  
  // GOALS
  
  // Get all goals for a user
  app.get("/api/goals", async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }

      const userIdNumber = parseInt(userId);
      const goals = await storage.getGoalsByUserId(userIdNumber);
      res.status(200).json({ goals });
    } catch (error) {
      console.error("Error getting goals:", error);
      res.status(500).json({ message: "Failed to retrieve goals" });
    }
  });
  
  // Get a single goal by ID
  app.get("/api/goals/:id", async (req: AuthenticatedRequest, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }
      
      const goal = await storage.getGoalById(goalId);
      
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      // Verify the goal belongs to the user
      if (goal.userId !== parseInt(userId)) {
        return res.status(403).json({ message: "Not authorized to access this goal" });
      }
      
      res.status(200).json(goal);
    } catch (error) {
      console.error("Error getting goal:", error);
      res.status(500).json({ message: "Failed to retrieve goal" });
    }
  });
  
  // Add a new goal
  app.post("/api/goals", async (req: AuthenticatedRequest, res) => {
    try {
      const { userId, ...goalData } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }
      
      const result = insertGoalSchema.safeParse(goalData);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid goal data",
          errors: result.error.errors 
        });
      }
      
      const newGoal = await storage.addGoal({
        ...result.data,
        userId: parseInt(userId)
      });
      
      res.status(201).json(newGoal);
    } catch (error) {
      console.error("Error adding goal:", error);
      res.status(500).json({ message: "Failed to add goal" });
    }
  });
  
  // Update goal progress
  app.patch("/api/goals/:id/progress", async (req: AuthenticatedRequest, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const { currentAmount, userId } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }
      
      if (typeof currentAmount !== 'number' || isNaN(currentAmount) || currentAmount < 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // Get the goal first to verify it belongs to the user
      const goal = await storage.getGoalById(goalId);
      
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      if (goal.userId !== parseInt(userId)) {
        return res.status(403).json({ message: "Not authorized to update this goal" });
      }
      
      const updatedGoal = await storage.updateGoalProgress(goalId, currentAmount);
      
      res.status(200).json(updatedGoal);
    } catch (error) {
      console.error("Error updating goal progress:", error);
      res.status(500).json({ message: "Failed to update goal" });
    }
  });
  
  // Update goal completion status
  app.patch("/api/goals/:id/complete", async (req: AuthenticatedRequest, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const { isCompleted, userId } = req.body;
      
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }
      
      if (typeof isCompleted !== 'boolean') {
        return res.status(400).json({ message: "Invalid completion status" });
      }
      
      // Get the goal first to verify it belongs to the user
      const goal = await storage.getGoalById(goalId);
      
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      if (goal.userId !== parseInt(userId)) {
        return res.status(403).json({ message: "Not authorized to update this goal" });
      }
      
      const updatedGoal = await storage.updateGoalCompletion(goalId, isCompleted);
      
      res.status(200).json(updatedGoal);
    } catch (error) {
      console.error("Error updating goal completion:", error);
      res.status(500).json({ message: "Failed to update goal" });
    }
  });
  
  // Delete a goal
  app.delete("/api/goals/:id", async (req: AuthenticatedRequest, res) => {
    try {
      const goalId = parseInt(req.params.id);
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }
      
      // Get the goal first to verify it belongs to the user
      const goal = await storage.getGoalById(goalId);
      
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      if (goal.userId !== parseInt(userId)) {
        return res.status(403).json({ message: "Not authorized to delete this goal" });
      }
      
      const success = await storage.deleteGoal(goalId);
      
      if (success) {
        res.status(200).json({ message: "Goal deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete goal" });
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Financial data (combined data for dashboard)
  app.get("/api/finance/data", async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        return res.status(401).json({ message: "User ID required" });
      }

      const userIdNumber = parseInt(userId);
      const transactions = await storage.getTransactionsByUserId(userIdNumber);
      const budgets = await storage.getBudgetsByUserId(userIdNumber);
      const goals = await storage.getGoalsByUserId(userIdNumber);
      
      // Get the user data but remove the password
      const user = await storage.getUser(userIdNumber);
      const userData = user ? { id: user.id, username: user.username } : null;
      
      res.status(200).json({ 
        transactions, 
        budgets,
        goals,
        user: userData
      });
    } catch (error) {
      console.error("Error getting financial data:", error);
      res.status(500).json({ message: "Failed to retrieve financial data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
