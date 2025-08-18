import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, authenticateToken, optionalAuth, requireAdmin, requireModerator } from "./auth";
import { insertUserSchema, insertRoomSchema, insertStorySchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import multer from "multer";

interface WebSocketClient extends WebSocket {
  userId?: string;
  roomId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup authentication
  setupAuth(app);
  
  // OpenAI client setup
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  console.log('OpenAI API Key status:', apiKey && apiKey.length > 0 ? `Present (${apiKey.length} chars)` : 'Missing or empty');
  let openai: OpenAI | null = null;
  
  if (apiKey && apiKey.length > 0) {
    try {
      openai = new OpenAI({ 
        apiKey: apiKey 
      });
      console.log('OpenAI client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OpenAI client:', error);
    }
  } else {
    console.log('OpenAI client not initialized - API key missing or empty');
  }
  
  // Multer setup for file uploads
  const upload = multer({ storage: multer.memoryStorage() });
  
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

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ message: "Access token required" });
      }
      
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
      const user = await storage.getUser(decoded.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(401).json({ message: "Invalid token" });
    }
  });

  // Simple admin login for testing
  app.post('/api/admin/login', async (req, res) => {
    try {
      // Simple mock JWT for admin access
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { id: 'admin-user-001', role: 'admin' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '24h' }
      );
      res.json({ token });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });

  // Admin routes for user management
  app.get('/api/admin/users', async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
  });

  app.patch('/api/admin/users/:id/role', requireAdmin as any, async (req, res) => {
    try {
      const { role } = req.body;
      if (!['user', 'moderator', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }
      
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Update user role
      const updatedUser = await storage.upsertUser({ 
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        username: user.username,
        role 
      });
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error });
    }
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
      if (userData.email) {
        const existingUser = await storage.getUserByEmail(userData.email);
        if (existingUser) {
          return res.status(400).json({ message: 'User already exists' });
        }
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
        creatorId: (req.user as any)?.claims?.sub || "",
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
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const storyData = insertStorySchema.parse({
        ...req.body,
        authorId: (req.user as any).id,
        authorName: (req.user as any).username || (req.user as any).email || "Anonymous",
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
      const userId = (req.user as any)?.claims?.sub || (req.user as any)?.id;
      const isHearted = await storage.toggleHeart(req.params.id, userId);
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

  // AI Routes
  app.post('/api/ai/transcribe', upload.single('audio'), async (req: any, res) => {
    try {
      if (!openai) {
        return res.status(503).json({ message: 'AI features unavailable - OpenAI API key not configured' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No audio file provided' });
      }

      const transcription = await openai.audio.transcriptions.create({
        file: new File([req.file.buffer], 'audio.wav', { type: 'audio/wav' }),
        model: 'whisper-1',
      });

      res.json({ text: transcription.text });
    } catch (error) {
      console.error('Transcription error:', error);
      res.status(500).json({ message: 'Transcription failed', error });
    }
  });

  app.post('/api/ai/continue-story', async (req, res) => {
    try {
      if (!openai) {
        return res.status(503).json({ message: 'AI features unavailable - OpenAI API key not configured' });
      }

      const { storyContext } = req.body;
      
      if (!storyContext || typeof storyContext !== 'string') {
        return res.status(400).json({ message: 'Story context is required' });
      }

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a creative writing assistant for a collaborative storytelling platform inspired by Nemrah Ahmed's work. Generate a natural, engaging continuation for the story that follows the established tone and style. Keep continuations between 50-150 words, maintaining the narrative flow. Focus on emotional depth and character development."
          },
          {
            role: "user",
            content: `Continue this story naturally: "${storyContext}"`
          }
        ],
        max_tokens: 200,
        temperature: 0.8,
      });

      const continuation = completion.choices[0].message.content?.trim() || '';
      res.json({ continuation });
    } catch (error) {
      console.error('Story continuation error:', error);
      res.status(500).json({ message: 'Story continuation failed', error });
    }
  });

  // Export Routes
  app.post('/api/export/pdf', async (req, res) => {
    try {
      const { chainId, title } = req.body;
      
      if (!chainId) {
        return res.status(400).json({ message: 'Chain ID is required' });
      }

      const stories = await storage.getStoriesByChain(parseInt(chainId));
      const fullStory = stories.map(story => story.content).join(' ');
      
      // For now, return a simple text response
      // In a real implementation, you'd use a PDF generation library like puppeteer
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${title || 'story'}.pdf"`);
      res.send(`PDF Export\n\nTitle: ${title || 'Untitled Story'}\n\nContent:\n${fullStory}`);
    } catch (error) {
      console.error('PDF export error:', error);
      res.status(500).json({ message: 'PDF export failed', error });
    }
  });

  app.post('/api/export/image', async (req, res) => {
    try {
      const { chainId, title } = req.body;
      
      if (!chainId) {
        return res.status(400).json({ message: 'Chain ID is required' });
      }

      const stories = await storage.getStoriesByChain(parseInt(chainId));
      const fullStory = stories.map(story => story.content).join(' ');
      
      // For now, return a simple text response
      // In a real implementation, you'd use a canvas/image generation library
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="${title || 'story'}.png"`);
      res.send(`Image Export\n\nTitle: ${title || 'Untitled Story'}\n\nContent:\n${fullStory}`);
    } catch (error) {
      console.error('Image export error:', error);
      res.status(500).json({ message: 'Image export failed', error });
    }
  });

  return httpServer;
}
