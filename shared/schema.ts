import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  avatar: text("avatar").default(""),
  contributionsCount: integer("contributions_count").notNull().default(0),
  heartsReceived: integer("hearts_received").notNull().default(0),
  experiencePoints: integer("experience_points").notNull().default(0),
  level: integer("level").notNull().default(1),
  badges: text("badges").array().default([]),
  preferences: json("preferences").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const rooms = pgTable("rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: varchar("code", { length: 6 }).notNull().unique(),
  prompt: text("prompt").notNull(),
  isPrivate: boolean("is_private").notNull().default(false),
  isThemed: boolean("is_themed").notNull().default(false),
  theme: text("theme").default(""),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  memberCount: integer("member_count").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const stories = pgTable("stories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chainId: integer("chain_id").notNull(),
  roomId: varchar("room_id").references(() => rooms.id),
  content: text("content").notNull(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  authorName: text("author_name").notNull(),
  sequence: integer("sequence").notNull(),
  hearts: integer("hearts").notNull().default(0),
  comments: integer("comments").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const hearts = pgTable("hearts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  storyId: varchar("story_id").notNull().references(() => stories.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const themes = pgTable("themes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  prompt: text("prompt").notNull(),
  isDaily: boolean("is_daily").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const cookiesPicks = pgTable("cookies_picks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  storyId: varchar("story_id").notNull().references(() => stories.id),
  reason: text("reason").default(""),
  isFeatured: boolean("is_featured").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  contributionsCount: true,
  heartsReceived: true,
  experiencePoints: true,
  level: true,
  badges: true,
  preferences: true,
  createdAt: true,
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
  code: true,
  memberCount: true,
  createdAt: true,
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  sequence: true,
  hearts: true,
  comments: true,
  createdAt: true,
});

export const insertThemeSchema = createInsertSchema(themes).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Room = typeof rooms.$inferSelect;
export type InsertRoom = z.infer<typeof insertRoomSchema>;

export type Story = typeof stories.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;

export type Theme = typeof themes.$inferSelect;
export type InsertTheme = z.infer<typeof insertThemeSchema>;

export type Heart = typeof hearts.$inferSelect;
export type CookiesPick = typeof cookiesPicks.$inferSelect;

// API Response types
export interface StoryChain {
  chainId: number;
  roomId?: string | null;
  stories: Story[];
  totalHearts: number;
  totalComments: number;
  contributorCount: number;
  createdAt: Date;
}

export interface RoomWithDetails extends Room {
  stories: Story[];
  activeUsers: number;
}

export interface CommunityStats {
  totalStories: number;
  activeUsers: number;
  totalHearts: number;
  dailyContributions: number;
}
