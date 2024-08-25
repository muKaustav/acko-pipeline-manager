FROM node:18-bullseye
WORKDIR /app

# Install npm packages
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

EXPOSE 3000

# Make sure all dependencies are installed before starting
CMD ["sh", "-c", "npm install && npm start"]