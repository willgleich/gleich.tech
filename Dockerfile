FROM node as Builder
WORKDIR /usr/src/app

# Install app dependencies
COPY src/ .
RUN npm install
WORKDIR /usr/src/app/
RUN node render.js
# If you are building your code for production
# RUN npm install --only=production

#EXPOSE 8080
#CMD [ "npm", "start"]

FROM nginx as production
COPY --from=Builder /usr/src/app/dist /usr/share/nginx/html/
COPY --from=Builder /usr/src/app/public /usr/share/nginx/html/

ADD default.conf  /etc/nginx/conf.d/

RUN chown -R nginx /usr/share/nginx/html/

