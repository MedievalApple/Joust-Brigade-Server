# Base image latest version of node
FROM node:latest

# Expose port 3000
EXPOSE 3000

# Setup work directory
WORKDIR /usr/src/app

# Copy package.json
COPY package*.json ./

# Install npm packages
RUN npm install

# Copy the rest of the Joust Brigade Server files
COPY . .

# Start Joust Brigade Server
CMD [ "npm", "run", "start" ]
