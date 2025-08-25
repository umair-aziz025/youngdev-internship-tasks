# Overview

**Someone Somewhere** is a collaborative storytelling web application inspired by Nemrah Ahmed's novels. The platform enables real-time community-driven storytelling where users contribute to ongoing narratives in a "Someone somewhere is..." continuation format. The application features a warm, cozy storytelling aesthetic with real-time updates, community engagement through hearts and comments, and AI-powered story assistance.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack React Query for server state management and caching
- **Theme System**: Custom theme provider with warm, cozy storytelling aesthetic using CSS variables

## Backend Architecture
- **Runtime**: Node.js with Express.js framework in TypeScript
- **API Design**: RESTful endpoints with type-safe validation using Zod schemas
- **Real-time Communication**: WebSocket connections for live story updates and user interactions
- **Authentication**: Mock user system for MVP development with plans for full authentication
- **Data Validation**: Shared Zod schemas between frontend and backend for consistency

## Database Design
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema Structure**: Comprehensive relational design including:
  - Users with experience points, levels, and badge systems
  - Rooms for organized storytelling sessions (public/private)
  - Stories with community engagement features (hearts, comments)
  - Themes for daily/weekly storytelling prompts
  - Community statistics and featured content curation

## Build and Development
- **Frontend Build**: Vite for fast development and optimized production builds
- **Backend Build**: esbuild for Node.js bundle compilation
- **Development**: Hot reload and runtime error overlay for enhanced developer experience
- **Type Safety**: Shared TypeScript configuration across frontend, backend, and shared modules

# External Dependencies

## Database
- **PostgreSQL**: Primary database using Neon serverless hosting for scalability
- **Drizzle Kit**: Database migrations and schema management

## AI Services
- **OpenAI GPT-4o**: Story continuation assistance and narrative enhancement
- **OpenAI Whisper**: Speech-to-text transcription for voice story submissions

## UI and Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent visual elements

## Development Tools
- **Cross-env**: Environment variable management across platforms
- **TypeScript**: Static typing for both frontend and backend
- **ESLint/Prettier**: Code quality and formatting (implied from structure)

## Authentication (Planned)
- **bcryptjs**: Password hashing for secure authentication
- **jsonwebtoken**: JWT token management for session handling
- **Multer**: File upload handling for user avatars and media

## Real-time Features
- **WebSocket**: Native WebSocket implementation for live story updates
- **Memoization**: Performance optimization for real-time data processing