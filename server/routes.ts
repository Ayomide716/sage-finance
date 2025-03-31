import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertBudgetSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // All API routes will be prefixed with /api
  
  // TRANSACTIONS
  
  // Get all transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.status(200).json({ transactions });
    } catch (error) {
      console.error("Error getting transactions:", error);
      res.status(500).json({ message: "Failed to retrieve transactions" });
    }
  });
  
  // Add a new transaction
  app.post("/api/transactions", async (req, res) => {
    try {
      const result = insertTransactionSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid transaction data",
          errors: result.error.errors 
        });
      }
      
      const newTransaction = await storage.addTransaction({
        ...result.data,
        userId: 1 // For simplicity, hardcode userId since we don't have auth
      });
      
      res.status(201).json(newTransaction);
    } catch (error) {
      console.error("Error adding transaction:", error);
      res.status(500).json({ message: "Failed to add transaction" });
    }
  });

  // BUDGETS
  
  // Get all budgets
  app.get("/api/budgets", async (req, res) => {
    try {
      const budgets = await storage.getAllBudgets();
      res.status(200).json({ budgets });
    } catch (error) {
      console.error("Error getting budgets:", error);
      res.status(500).json({ message: "Failed to retrieve budgets" });
    }
  });
  
  // Add a new budget
  app.post("/api/budgets", async (req, res) => {
    try {
      const result = insertBudgetSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid budget data",
          errors: result.error.errors 
        });
      }
      
      const newBudget = await storage.addBudget({
        ...result.data,
        userId: 1, // For simplicity, hardcode userId since we don't have auth
        spent: 0
      });
      
      res.status(201).json(newBudget);
    } catch (error) {
      console.error("Error adding budget:", error);
      res.status(500).json({ message: "Failed to add budget" });
    }
  });
  
  // Update budget spent amount
  app.patch("/api/budgets/:id/spent", async (req, res) => {
    try {
      const budgetId = parseInt(req.params.id);
      const { spent } = req.body;
      
      if (typeof spent !== 'number' || isNaN(spent) || spent < 0) {
        return res.status(400).json({ message: "Invalid spent amount" });
      }
      
      const updatedBudget = await storage.updateBudgetSpent(budgetId, spent);
      
      if (!updatedBudget) {
        return res.status(404).json({ message: "Budget not found" });
      }
      
      res.status(200).json(updatedBudget);
    } catch (error) {
      console.error("Error updating budget spent:", error);
      res.status(500).json({ message: "Failed to update budget" });
    }
  });
  
  // Financial data (combined data for dashboard)
  app.get("/api/finance/data", async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      const budgets = await storage.getAllBudgets();
      
      res.status(200).json({ transactions, budgets });
    } catch (error) {
      console.error("Error getting financial data:", error);
      res.status(500).json({ message: "Failed to retrieve financial data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
