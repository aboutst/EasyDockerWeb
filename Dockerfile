FROM node:lts-alpine

# 设置工作目录
WORKDIR /app

# 设置时区
ENV TZ=Europe/Paris
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

# 安装基础工具、pnpm 和 docker
# pnpm 版本由 package.json 的 packageManager 字段固定，避免浮动版本导致构建漂移
RUN apk add --no-cache bash tzdata docker-cli && \
    corepack enable

# 复制 package.json 和 pnpm-lock.yaml (如果存在)
COPY package.json pnpm-lock.yaml* ./

# 设置 pnpm store 目录并安装依赖
RUN pnpm config set store-dir /root/.local/share/pnpm/store && \
    pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 3000

# 使用 root 用户运行以确保 docker.sock 访问权限
USER root

# 启动应用
CMD ["node", "bin/www"]
