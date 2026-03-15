

# Journal App

Minimalistic and clean journaling app for recording daily journals. Built with Next.js, stores entries in SQLite, and supports Docker deployment.

Features:
- Create, edit, and organize journal entries
- Categorize and pin important notes
- AI-powered Reflections: get insights and feedback from agents (Ollama)


## Development

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Create `.env` file (see below for example values).
3. Start dev server:
   ```bash
   pnpm dev
   ```
4. Open [http://localhost:3000](http://localhost:3000)


## Configuration

- **SQLite**: Database at `db/journals.db` by default. Change with `DB_PATH` env variable:
   ```bash
   DB_PATH=/path/to/db.db pnpm dev
   ```

- **Redis**: Used for caching and agent reflections. Set `REDIS_URL` (default: `redis://localhost:6379`).
   ```bash
   REDIS_URL=redis://localhost:6379
   ```

- **Reflections (Ollama agents)**: Configure agent backend and model with these variables:
   ```bash
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=qwen3.5:35b
   OLLAMA_TIMEOUT=60000
   OLLAMA_TEMPERATURE=0.7
   OLLAMA_MAX_TOKENS=500
   OLLAMA_TOP_P=0.9
   OLLAMA_TOP_K=40
   ```

### Example .env

```
DB_PATH=db/journals.db
REDIS_URL=redis://localhost:6379
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3.5:35b
OLLAMA_TIMEOUT=60000
OLLAMA_TEMPERATURE=0.7
OLLAMA_MAX_TOKENS=500
OLLAMA_TOP_P=0.9
OLLAMA_TOP_K=40
```


## Deployment

### Docker

Build and run:
```bash
docker-compose up -d
```
Database persists in `./db`.

### Manual

Build and start:
```bash
pnpm build
pnpm start
```

## License

MIT License.