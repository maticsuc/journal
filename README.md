
# Journal App

A minimalistic journaling app built with Next.js and Supabase. Create, edit, organize, and get AI-powered reflections on your journal entries.

## Features

- **Journal Management** - Create, edit, delete, and organize entries
- **Categories & Pinning** - Categorize entries and pin important ones
- **Caching** - Redis-based caching for fast retrieval
- **AI Reflections** - Get insights from Ollama agents (marcus-aurelius, big-momma)
- **Multi-Environment** - Support for dev, production, and custom environments

## Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Supabase

### Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Create Supabase project:**
   - Run the SQL schema: `sql/000_initial_schema.sql`
   - Get your Project URL and anon key

3. **Configure `.env.local`:**
   ```env
   DB_ENVIRONMENT=development
   SUPABASE_URL_DEVELOPMENT=https://your-project.supabase.co
   SUPABASE_KEY_DEVELOPMENT=your-anon-key
   ```

4. **Start development server:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Architecture

```
Next.js API Routes → Database Layer → Supabase Client → PostgreSQL
```

**Key Files:**
- `app/api/journals/route.ts` - CRUD endpoints
- `lib/supabase-db.ts` - Database operations
- `lib/supabase.ts` - Client initialization
- `lib/cache.ts` - Redis caching
- `sql/` - Database schema

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/journals` | List all journals (cached) |
| POST | `/api/journals` | Create new journal |
| PUT | `/api/journals` | Update journal |
| PATCH | `/api/journals` | Toggle pinned |
| DELETE | `/api/journals` | Delete journal |
| POST | `/api/reflect` | Get AI reflection |

## Configuration

**Environment Variables:**
- `DB_ENVIRONMENT` - Which databases to use (development, production, etc)
- `SUPABASE_URL_*` - Supabase project URL
- `SUPABASE_KEY_*` - Supabase anonymous key
- `REDIS_URL` - Redis connection (optional, defaults to localhost:6379)
- `OLLAMA_BASE_URL` - Ollama API URL (optional)
- `OLLAMA_MODEL` - Ollama model name (optional)

**Multi-Environment:**
```bash
DB_ENVIRONMENT=production pnpm dev
```
Uses `SUPABASE_URL_PRODUCTION` and `SUPABASE_KEY_PRODUCTION`.

**Example `.env.local`:**
```env
# Required
DB_ENVIRONMENT=development
SUPABASE_URL_DEVELOPMENT=https://your-project.supabase.co
SUPABASE_KEY_DEVELOPMENT=your-anon-key

# Optional: Production environment
# SUPABASE_URL_PRODUCTION=https://...
# SUPABASE_KEY_PRODUCTION=...

# Optional: Caching (defaults to localhost:6379)
# REDIS_URL=redis://localhost:6379

# Optional: AI Reflections (Ollama)
# OLLAMA_BASE_URL=http://localhost:11434
# OLLAMA_MODEL=qwen3.5:35b
# OLLAMA_TIMEOUT=60000
# OLLAMA_TEMPERATURE=0.7
# OLLAMA_MAX_TOKENS=500
# OLLAMA_TOP_P=0.9
# OLLAMA_TOP_K=40
```

## Build & Deploy

```bash
pnpm build     # Production build
pnpm start     # Start server
docker-compose up  # Run with Docker (includes Ollama, Redis)
```

## License

MIT