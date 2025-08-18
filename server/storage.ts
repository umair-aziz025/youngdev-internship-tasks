import { type User, type InsertUser, type Room, type InsertRoom, type Story, type InsertStory, type StoryChain, type CommunityStats, type Theme, type CookiesPick } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
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
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
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

export const storage = new MemStorage();
