# syntax=docker/dockerfile:1
FROM node:16-alpine
RUN mkdir /app
COPY . /app
WORKDIR /app
RUN npm i -g roboflow-cli
ENTRYPOINT ["roboflow"]
