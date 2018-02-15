FROM node:8.5.0 

WORKDIR /usr/src/elevation-service

# Install node packages
COPY package.json ./
RUN npm install

# Copy the source for the app
COPY . .

# Set file permissions
RUN chmod -R 755 /usr/src/elevation-service

# Run the app
CMD ["npm", "start"]

# Expose container ports
EXPOSE 3000
