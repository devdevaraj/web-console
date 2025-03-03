FROM ubuntu:latest

RUN apt-get update && \
    apt-get install -y curl gnupg && \
    curl -sL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    apt-get install -y python3 python3-pip

RUN node -v && npm -v && python3 --version && pip3 --version

WORKDIR /home/user/app

COPY package.json .

RUN npm install debug --save

COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "npm", "start" ]