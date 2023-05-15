FROM node:latest
RUN echo fs.inotify.max_user_watches=582222 | tee -a /etc/sysctl.conf
RUN npm install -g nodemon
RUN mkdir /app
WORKDIR /app