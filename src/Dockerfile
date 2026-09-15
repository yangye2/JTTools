# ============================================================================
# JTTools 容器镜像
#
# 构建上下文(context) = 本文件所在目录（即 JTTools/src）
# 说明：JTTools 通过 NuGet 包引用 JT808/JT809/JT1078/JT905/JTActiveSafety，
#       不依赖仓库外层的协议源码，所以上下文只需要 src 目录。
#
# 构建：  docker build -t jttools:latest .
# 运行：  docker run -d --name jttools -p 18889:8080 jttools:latest
# 或：    docker compose up -d --build（需先在 docker-compose.yml 里打开 build 段）
#
# 常规部署直接拉取 CI 构建好的镜像，不需要本地构建：
#         docker pull ghcr.io/yangye2/jttools:latest
# ============================================================================

# ------------------------------ 构建阶段 ------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

ARG BUILD_CONFIGURATION=Release

WORKDIR /src

# 1) 先只拷贝工程文件，让 NuGet 还原这一步能被 Docker 层缓存复用
#    （只要 csproj 没变，改代码就不会重新下载依赖）
#
# 注意：这里刻意**不用** RUN --mount=type=cache 挂载 /root/.nuget/packages。
# cache mount 的内容不属于镜像层，而 restore 这一层会被 Docker 层缓存命中；
# 一旦命中，restore 命令不会真的执行，挂载点里就是空的或残缺的包，
# 后面 --no-restore 的 publish 就会报：
#   error NETSDK1064: Package X was not found. It might have been deleted since NuGet restore.
# （CI 上已经踩过一次，因为 GHA 的 10GB 缓存上限会挤掉部分包）
# 让包直接落在镜像层里，层缓存命中时包就在，两边状态永远一致。
COPY global.json ./
COPY JTTools/JTTools.csproj JTTools/
RUN dotnet restore JTTools/JTTools.csproj

# 2) 再拷贝全部源码（bin/obj/.git 已被 .dockerignore 排除）
COPY . .

RUN dotnet publish JTTools/JTTools.csproj \
        -c $BUILD_CONFIGURATION \
        -o /app/publish \
        --no-restore \
        /p:UseAppHost=false

# ------------------------------ 运行阶段 ------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

LABEL org.opencontainers.image.title="JTTools" \
      org.opencontainers.image.description="JT808/JT809/JT1078/JT905/JT19056 道路运输车辆卫星定位协议在线解析工具" \
      org.opencontainers.image.source="https://github.com/yangye2/JTTools" \
      org.opencontainers.image.licenses="MIT"

WORKDIR /app

# 容器内统一监听 8080；宿主机端口通过 -p 18889:8080 或 compose 的 ports 映射，
# 对外仍是 18889，和原来的 systemd 部署保持一致。
#
# ⚠️ 端口必须用下面 ENTRYPOINT 的 --urls 参数指定，不能用 ASPNETCORE_URLS：
#    ASPNETCORE_URLS 属于「主机配置」，会被 appsettings.json 里的
#    "urls": "http://*:18889;" 覆盖（已实测确认）。用了它容器会跑去监听 18889，
#    导致 compose 的 18889:8080 映射失效、健康检查也一直失败。
#    命令行参数优先级最高，所以这里用 --urls。
ENV ASPNETCORE_ENVIRONMENT=Production \
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

# --urls 会覆盖 appsettings.json 里的 "urls"，保证容器稳定监听 8080
ENTRYPOINT ["dotnet", "JTTools.dll", "--urls", "http://+:8080"]
