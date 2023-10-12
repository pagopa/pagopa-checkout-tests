FROM node:18.17.1

# It's a good idea to use dumb-init to help prevent zombie chrome processes.
ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

COPY .  /puppeteer/

WORKDIR /puppeteer

RUN yarn install

RUN unset PUPPETEER_SKIP_CHROMIUM_DOWNLOAD && node ./node_modules/puppeteer/install.js

CMD yarn test