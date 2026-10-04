# Pinned official Playwright image matching playwright@1.63.0 in package-lock.json
FROM mcr.microsoft.com/playwright:v1.63.0-noble

WORKDIR /app

# Ensure python symlink exists for python3
RUN ln -sf /usr/bin/python3 /usr/bin/python

# Copy dependency specifications for cached layer installation
COPY package*.json tsconfig.json ./

# Install exact pinned dependencies from package-lock.json
RUN npm ci

# Ensure Playwright browser binaries and Linux dependencies are completely installed
RUN npx playwright install --with-deps chromium

# Copy application source code and static assets
COPY . .

# Build TypeScript to production dist
RUN npm run build

# Default environment variables
ENV NODE_ENV=production
ENV HEADLESS=true
ENV ALLOWED_DOMAINS=*
ENV PORT=3000

EXPOSE 3000

# Link binary globally
RUN npm link

# Launch BrowserAgent Web Dashboard by default
CMD ["agent", "ui", "--no-open"]
