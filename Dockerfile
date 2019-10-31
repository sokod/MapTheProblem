FROM node:12.13-slim
MAINTAINER reOiL Alex MrAres
COPY . /app
WORKDIR /app
EXPOSE 8080
CMD ["node", "start.js"]
