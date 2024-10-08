###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:lts-alpine As development

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./
COPY --chown=node:node yarn.lock ./

RUN yarn install --immutable
COPY --chown=node:node . .

USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:lts-alpine As build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./
COPY --chown=node:node yarn.lock ./

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN yarn build

ENV NODE_ENV production

RUN yarn install --immutable --production && npm cache clean --force

USER node

###################
# PRODUCTION
###################

FROM node:lts-alpine As production

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

CMD [ "node", "dist/main.js" ]
