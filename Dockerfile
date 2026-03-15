# build
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# process
FROM node:20-slim
WORKDIR /app
# the build files and package.json are needed to run the app, so we copy them from the builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
RUN npm install --production

EXPOSE poses 3000
CMD ["node", "build"]