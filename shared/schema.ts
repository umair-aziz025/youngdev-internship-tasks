import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Password analysis result table for storing user results
export const passwordAnalyses = pgTable('password_analyses', {
  id: serial('id').primaryKey(),
  hashedPassword: text('hashed_password').notNull(), // Store hash, never plain text
  score: integer('score').notNull(),
  strength: text('strength').notNull(),
  feedback: text('feedback').array(), // Array of feedback strings
  details: text('details').notNull(), // JSON string of analysis details
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Insert schema for password analysis
export const insertPasswordAnalysisSchema = createInsertSchema(passwordAnalyses).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertPasswordAnalysis = z.infer<typeof insertPasswordAnalysisSchema>;
export type PasswordAnalysis = typeof passwordAnalyses.$inferSelect;