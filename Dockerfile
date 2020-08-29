FROM node

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY src/ .
RUN npm install
# If you are building your code for production
# RUN npm install --only=production

EXPOSE 8080
CMD [ "npm", "start"]