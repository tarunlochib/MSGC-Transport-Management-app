# Use Node.js 18 as base image (Alpine with modern OpenSSL)
FROM node:18-alpine

# Install required dependencies for Prisma
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd client && npm install
RUN cd server && npm install

# Copy the entire project
COPY . .

# Clean up any existing Prisma client
RUN rm -rf node_modules/.prisma
RUN rm -rf server/node_modules/.prisma

# Regenerate Prisma client for Linux in root directory
RUN npx prisma generate

# Also regenerate in server directory to ensure compatibility
RUN cd server && npx prisma generate

#Build the react app
RUN cd client && npm run build

#Expose the port
EXPOSE 10000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=10000

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Start the application
CMD ["node", "server/index.js"]