FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run compile
RUN mkdir -p /app/data
EXPOSE 8080
CMD ["npm","run","start"]
