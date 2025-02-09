# Use an official Node.js image.
FROM node:18-alpine

# Set working directory.
WORKDIR /app

# Copy package files and install dependencies.
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the source code.
COPY . .

# Expose the port that Vite runs on.
EXPOSE 3000

# Run the Vite development server.
CMD ["npm", "run", "dev"]
