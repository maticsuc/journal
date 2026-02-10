FROM node:20-alpine

# Install build dependencies for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++ sqlite-dev

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files and .npmrc for build configuration
COPY package*.json pnpm-lock.yaml .npmrc ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Force compilation of better-sqlite3 native bindings
RUN cd node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3 && \
    npm run install

# Copy source code
COPY . .

# Build the app
RUN pnpm run build

# Create data directories
RUN mkdir -p /data/db /data/journals

# Set environment variables
ENV DB_PATH=/data/db/journals.db
ENV JOURNALS_DIR=/data/journals

EXPOSE 3000

CMD ["pnpm", "start"]
