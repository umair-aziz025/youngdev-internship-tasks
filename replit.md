# Collaborative Storytelling Platform

## Overview

This is a real-time collaborative storytelling web application built with React, Express, and PostgreSQL. The platform allows users to create and join storytelling rooms where they can contribute to ongoing narratives in a chain-like format. Each story contribution builds upon the previous one, creating collaborative tales that evolve through community participation.

The application features both public storytelling spaces and private rooms with customizable prompts, real-time updates via WebSocket connections, and a modern UI built with shadcn/ui components and Tailwind CSS.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for storytelling theme
- **Build Tool**: Vite with TypeScript support and hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Real-time Communication**: WebSocket server for live story updates and room synchronization
- **API Design**: RESTful endpoints for CRUD operations with JSON responses
- **Middleware**: Custom request logging and error handling

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Relational design with tables for users, rooms, stories, hearts, and themes
- **Migrations**: Drizzle Kit for database schema management
- **Connection**: Neon Database serverless PostgreSQL connection

### Authentication and Authorization
- **Session Management**: Mock user system for MVP (planned for future auth integration)
- **User Context**: Static user object with plans for proper authentication
- **Request Headers**: User ID passed via API headers for authenticated requests

### External Dependencies
- **Database Provider**: Neon Database for managed PostgreSQL hosting
- **UI Components**: Radix UI for accessible component primitives
- **Form Handling**: React Hook Form with Zod validation
- **WebSocket**: Native WebSocket implementation for real-time features
- **Development Tools**: Replit integration with development banner and cartographer plugin

The architecture follows a modern full-stack approach with clear separation of concerns, type safety throughout the stack, and real-time capabilities for collaborative features. The design prioritizes user experience with a warm, storytelling-themed aesthetic and responsive design patterns.

## Recent Bug Fixes (January 2025)

### React Hooks Order Violation Fix
- **Issue**: Critical white page crashes caused by React hooks being called after conditional returns
- **Solution**: Moved all useQuery, useMutation, and custom hooks to the top of components before any conditional logic
- **Files Fixed**: 
  - Community page (client/src/pages/community.tsx)
  - Profile page (client/src/pages/profile.tsx) 
  - Rooms page (client/src/pages/rooms.tsx)
  - Admin page (client/src/pages/admin.tsx)
  - Home page (client/src/pages/home.tsx) - restored full functionality with proper hooks order
- **Result**: All pages now load correctly without white screen crashes, navigation works properly