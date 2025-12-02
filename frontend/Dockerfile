# Stage 1: Build the React application
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Serve the React application with Nginx
FROM nginx:alpine

# Copy the build output from the builder stage to Nginx's public directory
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
