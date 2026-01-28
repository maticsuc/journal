FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package*.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

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
