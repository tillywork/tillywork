# Stage 1: Build the app
FROM node:bullseye-slim AS build

# Set working directory
WORKDIR /app

ARG TW_VITE_POSTHOG_KEY
ENV TW_VITE_POSTHOG_KEY=${TW_VITE_POSTHOG_KEY}
ENV TW_VITE_API_URL=/api/v1

# Copy source code
COPY . .

# Install dependencies and cache them
RUN --mount=type=cache,target=/root/.npm npm ci

# Generate swagger metadata
RUN npm run swagger

# Build the app
RUN npm run build

# Stage 2: Final image with Nginx
FROM nginx:alpine-slim as runner

ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Install Node.js
RUN apk add --update nodejs npm

# Install PM2 globally
RUN npm install pm2 -g

# Copy backend build
COPY --from=build /app/dist/packages/backend ./dist/backend

# Copy shared package
COPY --from=build /app/dist/packages/shared ./dist/shared

# Copy frontend build
COPY --from=build /app/dist/packages/frontend /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx/frontend.conf /etc/nginx/conf.d/default.conf

# Copy ecosystem file for PM2
COPY ecosystem.config.js .
COPY package*.json ./
COPY packages/backend/package*.json ./packages/backend/

# Install dependencies
RUN npm ci

# Copy start script
COPY ./start.sh /start.sh
RUN chmod +x /start.sh

# Expose ports
EXPOSE 80
EXPOSE 3000

# Run the start script
CMD ["/start.sh"]