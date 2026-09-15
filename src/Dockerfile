# ============================================================================
# JTTools 容器镜像
#
# 构建上下文(context) = 本文件所在目录（即 JTTools/src）
# 说明：JTTools 通过 NuGet 包引用 JT808/JT809/JT1078/JT905/JTActiveSafety，
#       不依赖仓库外层的协议源码，所以上下文只需要 src 目录。
#
# 构建：  docker build -t jttools:latest .
# 运行：  docker run -d --name jttools -p 18889:8080 jttools:latest
# 或：    docker compose up -d --build
# ============================================================================

# ------------------------------ 构建阶段 ------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

ARG BUILD_CONFIGURATION=Release

WORKDIR /src

# 1) 先只拷贝工程文件，让 NuGet 还原这一步能被 Docker 层缓存复用
#    （只要 csproj 没变，改代码就不会重新下载依赖，VPS 上能省很多时间）
COPY global.json ./
COPY JTTools/JTTools.csproj JTTools/
RUN --mount=type=cache,target=/root/.nuget/packages \
    dotnet restore JTTools/JTTools.csproj

# 2) 再拷贝全部源码（bin/obj/.git 已被 .dockerignore 排除）
COPY . .

RUN --mount=type=cache,target=/root/.nuget/packages \
    dotnet publish JTTools/JTTools.csproj \
        -c $BUILD_CONFIGURATION \
        -o /app/publish \
        --no-restore \
        /p:UseAppHost=false

# ------------------------------ 运行阶段 ------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

LABEL org.opencontainers.image.title="JTTools" \
      org.opencontainers.image.description="JT808/JT809/JT1078/JT905/JT19056 道路运输车辆卫星定位协议在线解析工具" \
      org.opencontainers.image.source="https://github.com/SmallChi/JTTools" \
      org.opencontainers.image.licenses="MIT"

WORKDIR /app

# 容器内统一监听 8080；注意 appsettings.json 里写的是 18889，
# 这里用环境变量覆盖（环境变量优先级高于 appsettings.json）。
# 宿主机端口通过 -p 18889:8080 或 compose 的 ports 映射，对外仍是 18889。
ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production \
    DOTNET_RUNNING_IN_CONTAINER=true \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false \
    TZ=Asia/Shanghai

# 健康检查脚本（用 bash 的 /dev/tcp，无需安装 curl/wget）
COPY scripts/healthcheck.sh /app/scripts/healthcheck.sh

COPY --from=build /app/publish ./

EXPOSE 8080

# 使用镜像内置的非 root 用户（app，UID 1654）运行，降低容器逃逸风险
USER $APP_UID

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD ["timeout", "5", "bash", "/app/scripts/healthcheck.sh"]

ENTRYPOINT ["dotnet", "JTTools.dll"]
