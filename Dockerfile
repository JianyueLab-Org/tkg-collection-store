# Build stage
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
# 如果你有 lock 文件，建议也加上：COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-slim
WORKDIR /app

# 核心：必须设置环境变量，否则外部无法访问
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

# 拷贝构建产物
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json

# 安装生产环境依赖
RUN npm install --production

EXPOSE 3000

# 启动
CMD ["node", "build"]