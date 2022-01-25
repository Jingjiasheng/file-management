FROM node:16-slim

WORKDIR /server/

COPY . .

RUN npm install \
  && npm install ts-node --global 

ENV ROOT_DIR=/server/root/
ENV TEMP_DIR=/server/root/temp/
ENV NODE_ENV=prod
ENV PORT=80
EXPOSE 80
EXPOSE 443

LABEL org.opencontainers.image.authors="Jiashengjing"


# ENTRYPOINT [ "/bin/bash" ]
ENTRYPOINT [ "ts-node", "src/index.ts" ]