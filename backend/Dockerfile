# Backend Dockerfile with sandbox language support
FROM node:18

WORKDIR /app

# Install system dependencies and language runtimes for sandbox execution
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-dev \
    g++ \
    gcc \
    make \
    rustc \
    cargo \
    golang-go \
    openjdk-17-jdk-headless \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Create symbolic links for python and python3 compatibility
RUN ln -s /usr/bin/python3 /usr/bin/python || true

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create temp sandbox directory
RUN mkdir -p /app/temp_sandbox && chmod 777 /app/temp_sandbox

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Start the application
CMD ["npm", "run", "serve"]