# Use Node.js official image as a base
FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source code
COPY . .

# Expose the port your app will run on
EXPOSE 3001

# Start the app
CMD ["node", "index.js"]
