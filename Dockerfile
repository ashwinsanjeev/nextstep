# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

EXPOSE 5501

# Start the server (assuming app.js is your main server file)
CMD ["npm", "run", "dev"]
