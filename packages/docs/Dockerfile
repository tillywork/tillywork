# Stage 1: Build the app
FROM node:bullseye-slim AS build

# Set working directory
WORKDIR /app

# Copy source code
COPY . .

ENV NODE_ENV=production

# Install dependencies
RUN npm ci

# Build the app
RUN npm run build

# Stage 2: Final image with Nginx
FROM nginx:alpine-slim as runner

ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Copy frontend build
COPY --from=build /app/build /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx/docs.conf /etc/nginx/conf.d/default.conf

# Expose port for docs
EXPOSE 88

# Run the start script
CMD ["nginx", "-g", "daemon off;"]