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

3. Start the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

The app uses SQLite for data storage. By default, the database is created at `db/journals.db` in the project root.

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

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set the `DB_PATH` environment variable in Vercel if needed (though for serverless, you might need to use a different storage solution)

Note: For production deployments, consider using a more robust database solution instead of local SQLite files.

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
- **Icons**: Lucide React
- **Deployment**: Docker

## Contributing

This is a personal project, but feel free to open issues or submit pull requests for improvements.

## License

MIT License - see LICENSE file for details.