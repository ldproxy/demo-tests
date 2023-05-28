FROM node:18-alpine

COPY . /cats

RUN cd /cats && npm install --omit=dev

WORKDIR /cats

VOLUME ["/reports"]

ENTRYPOINT ["/cats/entrypoint.sh"]
