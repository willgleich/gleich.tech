FROM node
WORKDIR /usr/src/app
RUN chown -R node .
USER node

# Install app dependencies
COPY src/ .
RUN npm ci
# If you are building your code for production
# RUN npm install --only=production

EXPOSE 8080
CMD [ "npm", "start"]