# To build locally in isolation with a new container each time you can use the following commands sequentially:
# 1. 'docker build -t mazeio_frontend .
# 2. 'docker stop frontend'
# 3. 'docker rm frontend'
# 4. 'docker run -p 3000:3000 --name frontend mazeio_frontend'

# Sets base image (Node.js current LTS version at the time)
FROM node:22-alpine

# Direct subsequence instructions to operate within this directory
WORKDIR /app

# Setup application files and then place it inside container 
COPY package*.json ./
RUN npm install
COPY . .

# Additional information
ENV PORT=3000
EXPOSE 3000

# Start container
CMD ["npm", "run", "dev-exposed"]