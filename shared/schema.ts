import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Transaction schema
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'income' or 'expense'
  amount: real("amount").notNull(),
  category: text("category").notNull(),
  description: text("description").default(""),
  date: text("date").notNull(), // Store as ISO string format
  userId: integer("user_id").references(() => users.id).notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions)
  .pick({
    type: true,
    amount: true,
    category: true,
    description: true,
    date: true,
  })
  .refine((data) => data.type === 'income' || data.type === 'expense', {
    message: "Type must be either 'income' or 'expense'",
    path: ["type"],
  });

// Budget schema
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  amount: real("amount").notNull(),
  spent: real("spent").default(0),
  userId: integer("user_id").references(() => users.id).notNull(),
});

export const insertBudgetSchema = createInsertSchema(budgets)
  .pick({
    category: true,
    amount: true,
  });

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
