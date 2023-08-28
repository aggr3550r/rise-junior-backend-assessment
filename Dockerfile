# Use the official Node.js 14 image as the base
FROM node:14 AS base

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install --legacy-peer-deps


# Copy the rest of the application code to the working directory
COPY . .

# Build the TypeScript source code
RUN npm run build

# Remove development dependencies (optional)
# RUN npm prune --production

# Use a lightweight Node.js image for the final image
FROM node:14-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the built application code from the previous stage
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules

# Set the container port
EXPOSE 80

# Define the command to start the applicatiwon
CMD ["node", "dist/index.js"]
