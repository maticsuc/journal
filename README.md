# Journal App

A minimalistic journaling app built with Next.js and Supabase. Create, edit, organize, and get AI-powered reflections on journal entries.

## Features

- **Journal Management** - Create, edit, delete, and organize entries
- **Categories & Pinning** - Categorize entries and pin important ones
- **Caching** - Redis-based caching for fast retrieval
- **AI Reflections** - Get insights from Ollama or OpenRouter LLM agents
- **Multi-Environment** - Support for dev, production, and custom environments

## Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Supabase project

### Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up Supabase:
   - Run SQL schema: `sql/000_initial_schema.sql`
   - Get your Project URL and anon key

3. Configure `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Update with your Supabase credentials:
   ```env
   SUPABASE_URL_DEVELOPMENT=https://YOUR_PROJECT.supabase.co
   SUPABASE_KEY_DEVELOPMENT=YOUR_ANON_KEY
   ```

4. Start development server:
   ```bash
   pnpm dev
   ```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/journals` | List journals (cached) |
| POST | `/api/journals` | Create journal |
| PUT | `/api/journals` | Update journal |
| PATCH | `/api/journals` | Toggle pinned |
| DELETE | `/api/journals` | Delete journal |
| POST | `/api/reflect` | Get AI reflection |

## Configuration

**LLM Providers:**
- `LLM_PROVIDER=ollama` - Local inference (default)
- `LLM_PROVIDER=openrouter` - API-based access to various models

See `.env.example` for all configuration options.

## Build

```bash
pnpm build     # Production build
pnpm start     # Start server
docker-compose up  # Run with Docker
```

## License

MIT
