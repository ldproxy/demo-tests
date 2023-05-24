FROM node:18-alpine

COPY . /cats

RUN cd /cats && npm install

WORKDIR /cats

ENTRYPOINT ["/cats/woodpecker-plugin.sh"]
