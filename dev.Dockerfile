# base image
FROM buildkite/puppeteer:latest

# set working directory
WORKDIR /app

COPY ./package.json ./

# install and cache app dependencies
RUN npm install

COPY . .

# start app
CMD ["npm", "start"]