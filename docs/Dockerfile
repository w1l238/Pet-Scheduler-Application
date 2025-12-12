# Use a Node.js base image
FROM node:20

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Docusaurus runs on port 3000 by default
EXPOSE 3000

# Command to start the application
CMD ["npm", "start", "--", "--host", "0.0.0.0"]
