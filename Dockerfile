# Use an official Node.js base image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port your API listens on
EXPOSE 3000

# Define the startup command
CMD ["npm", "start"]
