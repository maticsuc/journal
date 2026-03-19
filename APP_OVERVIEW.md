# Journal App - Overview

## What It Does

A minimalistic journaling application that lets you capture, organize, and reflect on your thoughts. Write journal entries, categorize them, and get AI-powered reflections from different agent personalities that analyze your writings with unique perspectives.

### Main Features

- **Journal Entry Management** - Create, edit, delete, and organize journal entries with dates and titles
- **Rich Text Editing** - Write entries using a Markdown-powered text editor (TipTap)
- **Categorization** - Tag entries with custom categories for better organization
- **Pinning** - Mark important entries to keep them at the top
- **AI Reflections** - Get thoughtful responses from different AI agents (e.g., Marcus Aurelius, Bob Marley) that analyze your entries from their unique philosophical perspectives
- **Multi-Agent Support** - Switch between different reflection agents with distinct personalities and viewpoints
- **Caching** - Redis-based caching for fast entry retrieval
- **Dark/Light Theme** - Toggle between dark and light mode UI
- **Multi-Environment Support** - Run in development or production with different database configurations

## Tech Stack

### Frontend
- **Framework**: Next.js (React with TypeScript)
- **UI Components**: shadcn/ui (built on Radix UI)
- **Text Editor**: TipTap (rich markdown editor)
- **Styling**: Tailwind CSS + PostCSS
- **State Management**: React hooks
- **Forms**: React Hook Form
- **Notifications**: Sonner (toast notifications)
- **Animations**: Framer Motion
- **Icons**: Lucide Icons

### Backend
- **API Layer**: Next.js API Routes (TypeScript)
- **Database**: Supabase (PostgreSQL)
- **Caching**: Redis
- **AI/LLM**: Ollama (local LLM provider, with OpenRouter planned)

### Infrastructure & Deployment
- **Containerization**: Docker & Docker Compose
- **Package Manager**: pnpm
- **Analytics**: Vercel Analytics
- **Linting**: ESLint
- **Database Client**: Supabase JS SDK

## How It Was Made

### Architecture
```
Next.js Frontend → Next.js API Routes → Database Layer → Supabase/PostgreSQL
                                     ↓
                      Reflection System → Ollama/OpenRouter
                                     ↓
                      Caching Layer → Redis
```

### Key Implementation Details

1. **Full-Stack Next.js** - Combines frontend UI and backend API in a single Next.js application
2. **Database First** - PostgreSQL schema defined in `sql/000_initial_schema.sql` with Supabase as the hosted provider
3. **Custom Agent System** - Modular agent architecture in `lib/reflections/` where each agent (marcus-aurelius, bob-marley, etc.) has:
   - `IDENTITY.md` - Agent background and context
   - `INSTRUCTIONS.md` - System prompts and behavior guidelines
   - `SOUL.md` - Personality and unique perspective
4. **API Endpoints** - RESTful endpoints for:
   - `/api/journals` - CRUD operations on journal entries
   - `/api/reflect` - AI reflection generation
   - `/api/agents` - Agent management
5. **Caching Strategy** - Redis caches frequently accessed journal lists for performance
6. **Environment Configuration** - Flexible `.env.local` setup supporting multiple databases (dev/production)

### Development Workflow
- Real-time hot reload with Next.js dev server
- TypeScript for type safety
- Docker Compose for local development with all services (app, Supabase, Redis, Ollama)
- Git-based version control

## Purpose & Vision

Built as a personal reflection tool that combines the simplicity of traditional journaling with modern AI capabilities. The multi-agent approach allows you to get diverse perspectives on your thoughts—from the stoic wisdom of Marcus Aurelius to other philosophical viewpoints—creating a unique, introspective experience.

The emphasis on local-first (Ollama support) means you can keep your journals completely private while still benefiting from AI-powered insights.
