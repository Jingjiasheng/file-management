FROM node:16-slim

WORKDIR /server/

COPY . .


RUN npm install --only=prod \
  && npm install ts-node --global 


ENV ROOT_PATH_FILE=/server/root
ENV NODE_ENV=prod
ENV PORT=4040

VOLUME [ "/root_file" ]

LABEL org.opencontainers.image.authors="Jiashengjing"


ENTRYPOINT [ "/bin/bash" ]
# ENTRYPOINT [ "ts-node", "src/file-index.ts" ]