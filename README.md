# Journal App

A personal journaling application built with Next.js, featuring a clean interface for creating, editing, and organizing journal entries with categories and pinning functionality.

## Features

- 📝 Create and edit journal entries
- 🏷️ Organize entries with categories
- 📌 Pin important entries
- 🌙 Dark/Light theme toggle
- 📱 Responsive design
- 🗃️ SQLite database for local storage

## Installation

### Prerequisites

- Node.js 18 or later
- pnpm (recommended) or npm

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/journal.git
   cd journal
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. **For ARM64/Raspberry Pi users**: If you encounter errors about missing `better_sqlite3.node` bindings, you'll need to manually compile them:
   
   ```bash
   # Install build dependencies (if not already installed)
   sudo apt-get install -y build-essential python3
   
   # Navigate to better-sqlite3 and build
   cd node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3
   npm run install
   cd /home/matic/dev/journal-github
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Troubleshooting

### better-sqlite3 Native Bindings Error

If you see an error like "Could not locate the bindings file" for `better-sqlite3`:

**Cause**: The package requires native Node.js bindings that must be compiled for your specific architecture (especially ARM64/Raspberry Pi).

**Solution**:

1. Ensure you have the required build tools:
   ```bash
   sudo apt-get update
   sudo apt-get install -y build-essential python3 sqlite3 libsqlite3-dev
   ```

2. Clean and reinstall:
   ```bash
   rm -rf node_modules .next
   pnpm install
   ```

3. If the error persists, manually compile better-sqlite3:
   ```bash
   cd node_modules/.pnpm/better-sqlite3@12.6.2/node_modules/better-sqlite3
   npm run install
   ```
   
   Note: Compilation on ARM64 devices (like Raspberry Pi) may take several minutes.

4. Verify the native binding was created:
   ```bash
   ls -la node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3/build/Release/
   ```
   
   You should see `better_sqlite3.node` file.

## Configuration

The app uses SQLite for data storage. By default, the database is created at `db/journals.db` in the project root.

### Build Scripts Configuration

The project includes an `.npmrc` file that enables pre/post-install scripts for `better-sqlite3`:

```properties
enable-pre-post-scripts=true
scripts-allow-list=better-sqlite3
```

This configuration allows the native bindings to be compiled automatically during installation on supported systems.

### Environment Variables

You can customize the database location by setting the `DB_PATH` environment variable:

```bash
DB_PATH=/path/to/your/database.db pnpm dev
```

## Usage

1. **Creating Entries**: Click the "+" button to create a new journal entry. Fill in the date, title, content, and optionally add categories.

2. **Editing Entries**: Click the edit icon on any entry to modify it.

3. **Categories**: Add categories to organize your entries. Categories are automatically collected and displayed.

4. **Pinning**: Pin important entries to keep them at the top of the list.

5. **Themes**: Toggle between light and dark themes using the theme button.

## Deployment

### Using Docker

1. Build and run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

2. The database is persisted in the `./db` directory on the host.

### Manual Deployment

1. Build the application:
   ```bash
   pnpm build
   ```

2. Start the production server:
   ```bash
   pnpm start
   ```

## Project Structure

```
├── app/                 # Next.js app directory
│   ├── api/journals/    # API routes for journal operations
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main page component
├── components/          # Reusable UI components
├── lib/                 # Utility functions and database setup
├── db/                  # Database files (not committed)
└── journals/            # Journal text files (not committed)
```


## Technologies Used

- **Framework**: Next.js 16
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS
- **Database**: SQLite with better-sqlite3
- **Icons**: Custom SVG icon (see public/icon.svg), Lucide React
- **Deployment**: Docker

## Deployment

### Docker Deployment

The app includes Docker support for easy deployment:

```bash
# Build and run with docker-compose
docker compose up -d

# View logs
docker compose logs -f
```

### Raspberry Pi Public Instance

To run a second public instance alongside your production instance:

- **[Full Deployment Guide](RASPBERRY_PI_DEPLOYMENT.md)** - Complete step-by-step instructions for deploying a public instance with Tailscale, rate limiting, and bot protection
- **[Quick Reference](QUICK_DEPLOYMENT_REFERENCE.md)** - Essential commands and troubleshooting

**Included Configuration Files:**
- `docker-compose.public.yml` - Docker Compose config for public instance
- `nginx-journal-public.conf` - Nginx reverse proxy with rate limiting
- `backup-public.sh` - Automated database backup script
- `fail2ban-journal-public.conf` - Fail2ban filter for bot protection
- `fail2ban-journal-public.jail` - Fail2ban jail configuration

## Contributing

This is a personal project, but feel free to open issues or submit pull requests for improvements.

## License

MIT License - see LICENSE file for details.