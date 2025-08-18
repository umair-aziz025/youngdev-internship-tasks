import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Express, Request, Response, NextFunction } from 'express';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

// JWT secret - in production, use a strong random secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// User roles
export enum UserRole {
  COMMUNITY = 'community',
  MODERATOR = 'moderator',
  ADMIN = 'admin'
}

// User status
export enum UserStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected'
}

// Request with authenticated user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    status: UserStatus;
  };
}

// Registration schema
const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
});

// Login schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate JWT token
export function generateToken(user: { id: string; username: string; email: string; role: UserRole; status?: UserStatus }): string {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      email: user.email, 
      role: user.role,
      status: user.status || UserStatus.APPROVED
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Authentication middleware
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
}

// Optional authentication middleware (for routes that work with or without auth)
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  
  next();
}

// Role-based authorization middleware
export function requireRole(role: UserRole) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const roleHierarchy = {
      [UserRole.COMMUNITY]: 1,
      [UserRole.MODERATOR]: 2,
      [UserRole.ADMIN]: 3,
    };

    if (roleHierarchy[req.user.role] < roleHierarchy[role]) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
}

// Convenience middleware functions
export const requireAdmin = requireRole(UserRole.ADMIN);
export const requireModerator = requireRole(UserRole.MODERATOR);

// Setup authentication routes
export function setupAuth(app: Express) {
  // Register endpoint
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { username, email, password } = registerSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingUser.length > 0) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Check if username is taken
      const existingUsername = await db.select().from(users).where(eq(users.username, username)).limit(1);
      if (existingUsername.length > 0) {
        return res.status(400).json({ message: 'Username is already taken' });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const newUser = await db.insert(users).values({
        username,
        email,
        password: hashedPassword,
        role: UserRole.COMMUNITY, // Default role
        status: UserStatus.PENDING, // Pending approval
        experiencePoints: 0,
        level: 1,
        badges: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      res.status(201).json({
        message: 'Account created successfully. Please wait for admin approval.',
        user: {
          id: newUser[0].id,
          username: newUser[0].username,
          email: newUser[0].email,
          role: newUser[0].role,
          status: newUser[0].status,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = loginSchema.parse(req.body);

      // Find user by email
      const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (userResult.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const user = userResult[0];

      // Check if user has password (should not be null for local auth)
      if (!user.password) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check user status
      if (user.status === UserStatus.PENDING) {
        return res.status(401).json({ message: 'Account pending approval. Please wait for admin approval.' });
      }

      if (user.status === UserStatus.REJECTED) {
        return res.status(401).json({ message: 'Account access denied. Contact admin for more information.' });
      }

      if (user.status === UserStatus.SUSPENDED) {
        return res.status(401).json({ message: 'Account suspended. Contact admin for more information.' });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate token
      const token = generateToken({
        id: user.id,
        username: user.username || '',
        email: user.email || '',
        role: user.role as UserRole,
        status: user.status as UserStatus,
      });

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          experiencePoints: user.experiencePoints,
          level: user.level,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get current user endpoint
  app.get('/api/auth/me', authenticateToken as any, async (req: any, res: Response) => {
    try {
      const userResult = await db.select().from(users).where(eq(users.id, req.user!.id)).limit(1);
      if (userResult.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = userResult[0];
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          experiencePoints: user.experiencePoints,
          level: user.level,
          badges: user.badges,
        },
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Change role endpoint (admin only)
  app.patch('/api/auth/users/:userId/role', authenticateToken as any, requireAdmin as any, async (req: any, res: Response) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!Object.values(UserRole).includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }

      await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));

      res.json({ message: 'User role updated successfully' });
    } catch (error) {
      console.error('Update role error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Get all users (admin only)
  app.get('/api/admin/users', authenticateToken as any, requireAdmin as any, async (req: any, res: Response) => {
    try {
      const allUsers = await db.select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        status: users.status,
        contributionsCount: users.contributionsCount,
        experiencePoints: users.experiencePoints,
        level: users.level,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      }).from(users);

      res.json({ users: allUsers });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Update user status (admin only)
  app.patch('/api/admin/users/:userId/status', authenticateToken as any, requireAdmin as any, async (req: any, res: Response) => {
    try {
      const { userId } = req.params;
      const { status } = req.body;

      if (!Object.values(UserStatus).includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      await db.update(users).set({ status, updatedAt: new Date() }).where(eq(users.id, userId));

      res.json({ message: 'User status updated successfully' });
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Update user role (admin only)
  app.patch('/api/admin/users/:userId/role', authenticateToken as any, requireAdmin as any, async (req: any, res: Response) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!Object.values(UserRole).includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
      }

      await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, userId));

      res.json({ message: 'User role updated successfully' });
    } catch (error) {
      console.error('Update role error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Delete user (admin only)
  app.delete('/api/admin/users/:userId', authenticateToken as any, requireAdmin as any, async (req: any, res: Response) => {
    try {
      const { userId } = req.params;

      // Prevent admin from deleting themselves
      if (userId === req.user.id) {
        return res.status(400).json({ message: 'Cannot delete your own account' });
      }

      await db.delete(users).where(eq(users.id, userId));

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Create admin account on first startup
  app.post('/api/auth/create-admin', async (req: Request, res: Response) => {
    try {
      // Check if any admin already exists
      const existingAdmin = await db.select().from(users).where(eq(users.role, UserRole.ADMIN)).limit(1);
      if (existingAdmin.length > 0) {
        return res.status(400).json({ message: 'Admin account already exists' });
      }

      const { username, email, password } = registerSchema.parse(req.body);

      // Create admin account
      const hashedPassword = await hashPassword(password);
      const newAdmin = await db.insert(users).values({
        username,
        email,
        password: hashedPassword,
        role: UserRole.ADMIN,
        status: UserStatus.APPROVED,
        experiencePoints: 0,
        level: 1,
        badges: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      res.status(201).json({
        message: 'Admin account created successfully',
        user: {
          id: newAdmin[0].id,
          username: newAdmin[0].username,
          email: newAdmin[0].email,
          role: newAdmin[0].role,
        },
      });
    } catch (error) {
      console.error('Create admin error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid input', errors: error.errors });
      }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  console.log('✅ Authentication system initialized');
}
