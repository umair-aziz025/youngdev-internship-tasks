import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertRoomSchema, insertStorySchema } from "@shared/schema";
import { z } from "zod";

interface WebSocketClient extends WebSocket {
  userId?: string;
  roomId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Set<WebSocketClient>();
  const roomClients = new Map<string, Set<WebSocketClient>>();

  wss.on('connection', (ws: WebSocketClient) => {
    clients.add(ws);
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        switch (data.type) {
          case 'join-room':
            if (ws.roomId && roomClients.has(ws.roomId)) {
              roomClients.get(ws.roomId)!.delete(ws);
            }
            
            ws.roomId = data.roomId;
            ws.userId = data.userId;
            
            if (!roomClients.has(data.roomId)) {
              roomClients.set(data.roomId, new Set());
            }
            roomClients.get(data.roomId)!.add(ws);
            
            // Update room member count
            const roomSize = roomClients.get(data.roomId)!.size;
            await storage.updateRoomMemberCount(data.roomId, 0); // Set to actual count
            break;
            
          case 'story-added':
            // Broadcast new story to room members
            if (ws.roomId && roomClients.has(ws.roomId)) {
              const roomMembers = roomClients.get(ws.roomId)!;
              roomMembers.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify({
                    type: 'new-story',
                    story: data.story,
                    chainId: data.chainId
                  }));
                }
              });
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      clients.delete(ws);
      if (ws.roomId && roomClients.has(ws.roomId)) {
        roomClients.get(ws.roomId)!.delete(ws);
        if (roomClients.get(ws.roomId)!.size === 0) {
          roomClients.delete(ws.roomId);
        }
      }
    });
  });

  // Auth middleware (simplified for MVP)
  const requireAuth = async (req: any, res: any, next: any) => {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const user = await storage.getUser(userId as string);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  };

  // Users
  app.post('/api/users', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: 'Invalid user data', error });
    }
  });

  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });

  // Rooms
  app.post('/api/rooms', requireAuth, async (req, res) => {
    try {
      const roomData = insertRoomSchema.parse({
        ...req.body,
        creatorId: req.user.id,
      });
      
      const room = await storage.createRoom(roomData);
      res.json(room);
    } catch (error) {
      res.status(400).json({ message: 'Invalid room data', error });
    }
  });

  app.get('/api/rooms/public', async (req, res) => {
    try {
      const rooms = await storage.getPublicRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });

  app.get('/api/rooms/code/:code', async (req, res) => {
    try {
      const room = await storage.getRoomByCode(req.params.code);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });

  // Stories
  app.post('/api/stories', requireAuth, async (req, res) => {
    try {
      const storyData = insertStorySchema.parse({
        ...req.body,
        authorId: req.user.id,
        authorName: req.user.username,
      });
      
      const story = await storage.createStory(storyData);
      res.json(story);
    } catch (error) {
      res.status(400).json({ message: 'Invalid story data', error });
    }
  });

  app.get('/api/stories/chains', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const chains = await storage.getLatestStoryChains(limit);
      res.json(chains);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });

  app.get('/api/stories/chain/:chainId', async (req, res) => {
    try {
      const chainId = parseInt(req.params.chainId);
      const stories = await storage.getStoriesByChain(chainId);
      res.json(stories);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });

  app.post('/api/stories/:id/heart', requireAuth, async (req, res) => {
    try {
      const isHearted = await storage.toggleHeart(req.params.id, req.user.id);
      res.json({ hearted: isHearted });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });

  app.get('/api/stories/next-chain-id', async (req, res) => {
    try {
      const chainId = await storage.getNextChainId();
      res.json({ chainId });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });

  // Themes
  app.get('/api/themes/daily', async (req, res) => {
    try {
      const theme = await storage.getDailyTheme();
      res.json(theme);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });

  app.get('/api/themes', async (req, res) => {
    try {
      const themes = await storage.getAllThemes();
      res.json(themes);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });

  // Community
  app.get('/api/community/stats', async (req, res) => {
    try {
      const stats = await storage.getCommunityStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });

  app.get('/api/community/cookies-picks', async (req, res) => {
    try {
      const picks = await storage.getCookiesPicks();
      res.json(picks);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });

  return httpServer;
}
