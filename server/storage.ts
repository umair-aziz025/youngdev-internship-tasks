import { type User, type InsertUser, type UpsertUser, type Room, type InsertRoom, type Story, type InsertStory, type StoryChain, type CommunityStats, type Theme, type CookiesPick } from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { users, rooms, stories, hearts, themes, cookiesPicks } from '@shared/schema';
import { eq, desc, sql, and } from 'drizzle-orm';

export interface IStorage {
  // Users (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStats(userId: string, contributions?: number, hearts?: number): Promise<void>;
  
  // Rooms
  getRoom(id: string): Promise<Room | undefined>;
  getRoomByCode(code: string): Promise<Room | undefined>;
  createRoom(room: InsertRoom): Promise<Room>;
  getPublicRooms(): Promise<Room[]>;
  updateRoomMemberCount(roomId: string, count: number): Promise<void>;
  
  // Stories
  getStory(id: string): Promise<Story | undefined>;
  createStory(story: InsertStory): Promise<Story>;
  getStoriesByChain(chainId: number): Promise<Story[]>;
  getStoriesByRoom(roomId: string): Promise<Story[]>;
  getLatestStoryChains(limit?: number): Promise<StoryChain[]>;
  toggleHeart(storyId: string, userId: string): Promise<boolean>;
  getNextChainId(): Promise<number>;
  
  // Themes
  getDailyTheme(): Promise<Theme | undefined>;
  getAllThemes(): Promise<Theme[]>;
  
  // Community
  getCommunityStats(): Promise<CommunityStats>;
  getCookiesPicks(): Promise<CookiesPick[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private rooms: Map<string, Room>;
  private stories: Map<string, Story>;
  private hearts: Map<string, Set<string>>; // storyId -> Set of userIds
  private themes: Map<string, Theme>;
  private cookiesPicks: Map<string, CookiesPick>;
  private chainCounter: number;

  constructor() {
    this.users = new Map();
    this.rooms = new Map();
    this.stories = new Map();
    this.hearts = new Map();
    this.themes = new Map();
    this.cookiesPicks = new Map();
    this.chainCounter = 1;
    
    this.initializeData();
  }

  private initializeData() {
    // Create sample themes
    const themes = [
      {
        id: randomUUID(),
        title: "Jannat Kay Pattay Vibes",
        description: "Stories about finding home in people, not places",
        prompt: "Someone somewhere is discovering that home isn't a place, but the people who make your heart feel at peace...",
        isDaily: true,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Nemrah Ahmed Inspired",
        description: "Mystery and family secrets",
        prompt: "Someone somewhere just discovered a hidden truth that changes everything they thought they knew...",
        isDaily: false,
        isActive: true,
        createdAt: new Date(),
      }
    ];
    
    themes.forEach(theme => this.themes.set(theme.id, theme));
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      contributionsCount: 0,
      heartsReceived: 0,
      experiencePoints: 0,
      level: 1,
      badges: [],
      preferences: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    if (existingUser) {
      const updatedUser = {
        ...existingUser,
        ...userData,
        updatedAt: new Date(),
      };
      this.users.set(updatedUser.id, updatedUser);
      return updatedUser;
    } else {
      return this.createUser(userData as InsertUser);
    }
  }

  async updateUserStats(userId: string, contributions = 0, hearts = 0): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.contributionsCount += contributions;
      user.heartsReceived += hearts;
      this.users.set(userId, user);
    }
  }

  // Rooms
  async getRoom(id: string): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async getRoomByCode(code: string): Promise<Room | undefined> {
    return Array.from(this.rooms.values()).find(room => room.code === code);
  }

  async createRoom(insertRoom: InsertRoom): Promise<Room> {
    const id = randomUUID();
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const room: Room = {
      ...insertRoom,
      id,
      code,
      isPrivate: insertRoom.isPrivate || false,
      isThemed: insertRoom.isThemed || false,
      theme: insertRoom.theme || "",
      memberCount: 1,
      createdAt: new Date(),
    };
    this.rooms.set(id, room);
    return room;
  }

  async getPublicRooms(): Promise<Room[]> {
    return Array.from(this.rooms.values())
      .filter(room => !room.isPrivate)
      .sort((a, b) => b.memberCount - a.memberCount);
  }

  async updateRoomMemberCount(roomId: string, count: number): Promise<void> {
    const room = this.rooms.get(roomId);
    if (room) {
      room.memberCount = Math.max(0, room.memberCount + count);
      this.rooms.set(roomId, room);
    }
  }

  // Stories
  async getStory(id: string): Promise<Story | undefined> {
    return this.stories.get(id);
  }

  async createStory(insertStory: InsertStory): Promise<Story> {
    const id = randomUUID();
    const story: Story = {
      ...insertStory,
      id,
      roomId: insertStory.roomId || null,
      hearts: 0,
      comments: 0,
      createdAt: new Date(),
    };
    this.stories.set(id, story);
    
    // Update user contributions
    await this.updateUserStats(story.authorId, 1, 0);
    
    return story;
  }

  async getStoriesByChain(chainId: number): Promise<Story[]> {
    return Array.from(this.stories.values())
      .filter(story => story.chainId === chainId)
      .sort((a, b) => a.sequence - b.sequence);
  }

  async getStoriesByRoom(roomId: string): Promise<Story[]> {
    return Array.from(this.stories.values())
      .filter(story => story.roomId === roomId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getLatestStoryChains(limit = 10): Promise<StoryChain[]> {
    const chainGroups = new Map<number, Story[]>();
    
    // Group stories by chainId
    Array.from(this.stories.values()).forEach(story => {
      if (!chainGroups.has(story.chainId)) {
        chainGroups.set(story.chainId, []);
      }
      chainGroups.get(story.chainId)!.push(story);
    });

    // Convert to StoryChain objects
    const chains: StoryChain[] = Array.from(chainGroups.entries()).map(([chainId, stories]) => {
      const sortedStories = stories.sort((a, b) => a.sequence - b.sequence);
      const totalHearts = stories.reduce((sum, story) => sum + story.hearts, 0);
      const totalComments = stories.reduce((sum, story) => sum + story.comments, 0);
      const contributorCount = new Set(stories.map(s => s.authorId)).size;
      
      return {
        chainId,
        roomId: stories[0]?.roomId,
        stories: sortedStories,
        totalHearts,
        totalComments,
        contributorCount,
        createdAt: sortedStories[0]?.createdAt || new Date(),
      };
    });

    // Sort by latest activity and return limited results
    return chains
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async toggleHeart(storyId: string, userId: string): Promise<boolean> {
    if (!this.hearts.has(storyId)) {
      this.hearts.set(storyId, new Set());
    }
    
    const storyHearts = this.hearts.get(storyId)!;
    const story = this.stories.get(storyId);
    
    if (!story) return false;
    
    if (storyHearts.has(userId)) {
      // Remove heart
      storyHearts.delete(userId);
      story.hearts = Math.max(0, story.hearts - 1);
      await this.updateUserStats(story.authorId, 0, -1);
      return false;
    } else {
      // Add heart
      storyHearts.add(userId);
      story.hearts += 1;
      await this.updateUserStats(story.authorId, 0, 1);
      return true;
    }
  }

  async getNextChainId(): Promise<number> {
    return this.chainCounter++;
  }

  // Themes
  async getDailyTheme(): Promise<Theme | undefined> {
    return Array.from(this.themes.values()).find(theme => theme.isDaily && theme.isActive);
  }

  async getAllThemes(): Promise<Theme[]> {
    return Array.from(this.themes.values()).filter(theme => theme.isActive);
  }

  // Community
  async getCommunityStats(): Promise<CommunityStats> {
    const totalStories = this.stories.size;
    const activeUsers = this.users.size;
    const totalHearts = Array.from(this.stories.values()).reduce((sum, story) => sum + story.hearts, 0);
    
    // Daily contributions (stories from today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyContributions = Array.from(this.stories.values())
      .filter(story => story.createdAt >= today).length;

    return {
      totalStories,
      activeUsers,
      totalHearts,
      dailyContributions,
    };
  }

  async getCookiesPicks(): Promise<CookiesPick[]> {
    return Array.from(this.cookiesPicks.values())
      .filter(pick => pick.isFeatured)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  private db: any;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL not found in environment variables");
    }
    const connection = neon(process.env.DATABASE_URL);
    this.db = drizzle(connection);
    this.initializeData();
  }

  private async initializeData() {
    try {
      // Check if themes exist, if not create them
      const existingThemes = await this.db.select().from(themes).limit(1);
      if (existingThemes.length === 0) {
        const sampleThemes = [
          {
            title: "Jannat Kay Pattay Vibes",
            description: "Stories about finding home in people, not places",
            prompt: "Someone somewhere is discovering that home isn't a place, but the people who make your heart feel at peace...",
            isDaily: true,
            isActive: true,
          },
          {
            title: "Nemrah Ahmed Inspired",
            description: "Mystery and family secrets",
            prompt: "Someone somewhere just discovered a hidden truth that changes everything they thought they knew...",
            isDaily: false,
            isActive: true,
          },
        ];
        
        await this.db.insert(themes).values(sampleThemes);
      }
    } catch (error) {
      console.log("Failed to initialize themes:", error);
    }
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const result = await this.db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          username: userData.username,
          role: userData.role,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  }

  async updateUserStats(userId: string, contributions?: number, hearts?: number): Promise<void> {
    const updates: any = {};
    if (contributions !== undefined) {
      updates.contributionsCount = sql`${users.contributionsCount} + ${contributions}`;
    }
    if (hearts !== undefined) {
      updates.heartsReceived = sql`${users.heartsReceived} + ${hearts}`;
    }
    
    if (Object.keys(updates).length > 0) {
      await this.db.update(users).set(updates).where(eq(users.id, userId));
    }
  }

  // Rooms
  async getRoom(id: string): Promise<Room | undefined> {
    const result = await this.db.select().from(rooms).where(eq(rooms.id, id)).limit(1);
    return result[0];
  }

  async getRoomByCode(code: string): Promise<Room | undefined> {
    const result = await this.db.select().from(rooms).where(eq(rooms.code, code)).limit(1);
    return result[0];
  }

  async createRoom(room: InsertRoom): Promise<Room> {
    const result = await this.db.insert(rooms).values(room).returning();
    return result[0];
  }

  async getPublicRooms(): Promise<Room[]> {
    return await this.db.select().from(rooms).where(eq(rooms.isPrivate, false)).orderBy(desc(rooms.createdAt));
  }

  async updateRoomMemberCount(roomId: string, count: number): Promise<void> {
    await this.db.update(rooms).set({ memberCount: count }).where(eq(rooms.id, roomId));
  }

  // Stories
  async getStory(id: string): Promise<Story | undefined> {
    const result = await this.db.select().from(stories).where(eq(stories.id, id)).limit(1);
    return result[0];
  }

  async createStory(story: InsertStory): Promise<Story> {
    // Get next sequence number for this chain
    const maxSeq = await this.db.select({ max: sql<number>`max(${stories.sequence})` })
      .from(stories)
      .where(eq(stories.chainId, story.chainId));
    
    const sequence = (maxSeq[0]?.max || 0) + 1;
    
    const result = await this.db.insert(stories).values({
      ...story,
      sequence
    }).returning();
    
    return result[0];
  }

  async getStoriesByChain(chainId: number): Promise<Story[]> {
    return await this.db.select().from(stories)
      .where(eq(stories.chainId, chainId))
      .orderBy(stories.sequence);
  }

  async getStoriesByRoom(roomId: string): Promise<Story[]> {
    return await this.db.select().from(stories)
      .where(eq(stories.roomId, roomId))
      .orderBy(desc(stories.createdAt));
  }

  async getLatestStoryChains(limit = 10): Promise<StoryChain[]> {
    const chainsData = await this.db
      .select({
        chainId: stories.chainId,
        storyCount: sql<number>`count(*)`,
        lastUpdated: sql<Date>`max(${stories.createdAt})`,
        stories: sql<Story[]>`json_agg(
          json_build_object(
            'id', ${stories.id},
            'chainId', ${stories.chainId},
            'roomId', ${stories.roomId},
            'content', ${stories.content},
            'authorId', ${stories.authorId},
            'authorName', ${stories.authorName},
            'sequence', ${stories.sequence},
            'hearts', ${stories.hearts},
            'comments', ${stories.comments},
            'createdAt', ${stories.createdAt}
          ) ORDER BY ${stories.sequence}
        )`
      })
      .from(stories)
      .groupBy(stories.chainId)
      .orderBy(desc(sql`max(${stories.createdAt})`))
      .limit(limit);

    return chainsData.map(chain => ({
      chainId: chain.chainId,
      storyCount: chain.storyCount,
      lastUpdated: chain.lastUpdated,
      stories: chain.stories
    }));
  }

  async toggleHeart(storyId: string, userId: string): Promise<boolean> {
    const existing = await this.db.select().from(hearts)
      .where(and(eq(hearts.storyId, storyId), eq(hearts.userId, userId)))
      .limit(1);

    if (existing.length > 0) {
      // Remove heart
      await this.db.delete(hearts)
        .where(and(eq(hearts.storyId, storyId), eq(hearts.userId, userId)));
      
      await this.db.update(stories)
        .set({ hearts: sql`${stories.hearts} - 1` })
        .where(eq(stories.id, storyId));
      
      return false;
    } else {
      // Add heart
      await this.db.insert(hearts).values({ storyId, userId });
      
      await this.db.update(stories)
        .set({ hearts: sql`${stories.hearts} + 1` })
        .where(eq(stories.id, storyId));
      
      return true;
    }
  }

  async getNextChainId(): Promise<number> {
    const result = await this.db.select({ max: sql<number>`coalesce(max(${stories.chainId}), 0) + 1` }).from(stories);
    return result[0]?.max || 1;
  }

  // Themes
  async getDailyTheme(): Promise<Theme | undefined> {
    const result = await this.db.select().from(themes)
      .where(and(eq(themes.isDaily, true), eq(themes.isActive, true)))
      .limit(1);
    return result[0];
  }

  async getAllThemes(): Promise<Theme[]> {
    return await this.db.select().from(themes).where(eq(themes.isActive, true));
  }

  // Community
  async getCommunityStats(): Promise<CommunityStats> {
    const [storiesCount, usersCount, heartsCount] = await Promise.all([
      this.db.select({ count: sql<number>`count(*)` }).from(stories),
      this.db.select({ count: sql<number>`count(*)` }).from(users),
      this.db.select({ count: sql<number>`sum(${stories.hearts})` }).from(stories)
    ]);

    // Daily contributions (stories from today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyContributions = await this.db.select({ count: sql<number>`count(*)` })
      .from(stories)
      .where(sql`${stories.createdAt} >= ${today}`);

    return {
      totalStories: storiesCount[0]?.count || 0,
      activeUsers: usersCount[0]?.count || 0,
      totalHearts: heartsCount[0]?.count || 0,
      dailyContributions: dailyContributions[0]?.count || 0,
    };
  }

  async getCookiesPicks(): Promise<CookiesPick[]> {
    return await this.db.select().from(cookiesPicks)
      .where(eq(cookiesPicks.isFeatured, true))
      .orderBy(desc(cookiesPicks.createdAt));
  }
}

// Use database storage if DATABASE_URL is available, otherwise fall back to memory
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
