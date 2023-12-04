FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=3000
ENV GITHUB_ACCESS_TOKEN=your-github-access-token

EXPOSE $PORT

RUN npm install -g pm2

#CMD ["node", "index.js"]
