# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the source code
COPY . .

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
