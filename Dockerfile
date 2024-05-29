# Stage 1: Build the app
FROM node:bullseye-slim AS build

# Set working directory
WORKDIR /app

# Copy source code
COPY . .

# Install dependencies
RUN npm ci

# Build the app
RUN npm run build

# Stage 3: Final image with Nginx for frontend and Node for backend
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

# Copy frontend build
COPY --from=build /app/dist/packages/frontend /usr/share/nginx/html

# Copy docs build
COPY --from=build /app/packages/docs/build /usr/share/nginx/html/docs

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

# Expose ports for frontend (Nginx) and backend (Node.js)
EXPOSE 80
EXPOSE 3000

# Run the start script
CMD ["/start.sh"]