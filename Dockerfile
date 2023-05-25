FROM node:18-alpine

COPY . /cats

RUN cd /cats && npm install --omit=dev

WORKDIR /cats

VOLUME ["/cats/filter-queries/report"]

ENTRYPOINT ["/cats/woodpecker-plugin.sh"]
