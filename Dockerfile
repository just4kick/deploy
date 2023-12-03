# Use the official Node.js image as a base image
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Set environment variables
ENV PORT=3000
ENV GITHUB_ACCESS_TOKEN=your-github-access-token

# Expose the port your app runs on
EXPOSE $PORT

# Define the command to run your application
CMD ["node", "index.js"]
