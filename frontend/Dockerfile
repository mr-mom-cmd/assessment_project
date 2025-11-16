# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build argument for API URL (Vite env vars must be available at build time)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the application
RUN npm run build

# Stage 2: Serve the application from a lightweight server
FROM node:20-alpine AS runtime

WORKDIR /app

# Install the 'serve' package to run the app
RUN npm install -g serve

# Copy the built application from the build stage
COPY --from=build /app/dist ./dist

# Set the port and environment
ENV PORT=8080
ENV NODE_ENV=production

# Expose the port
EXPOSE 8080

# Add a health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080', (res) => {if (res.statusCode !== 200) throw new Error(res.statusCode)})"

# Run the server
CMD ["serve", "-s", "dist", "-l", "8080"]
