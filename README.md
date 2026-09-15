# JTTools

JT808、JT809、JT1078、JT905、JT19056 道路运输车辆卫星定位协议在线解析工具。

- 在线解析工具：<https://jttools.smallchi.cn/>
- Swagger 接口文档（本地）：<http://127.0.0.1:18889/jttui/swagger>

## 支持的协议

| 菜单 | 说明 |
| --- | --- |
| JT808 | 国标（自动识别 2011/2013/2019 版本，支持分包自动合并） |
| JT808 扩展 | JT1078、主动安全（苏标 / 粤标）、锐明公交、GPS51 私有协议 |
| JT809 | 平台数据交换（2011 / 2019，支持加密报文解密） |
| JT1078 | 音视频 RTP 包解析 |
| JT19056 | 汽车行驶记录仪（上行 / 下行） |
| JT905 | 出租车调度协议 |
| 主动安全 | 主动安全（苏标）报警附件包 |
| Hex 工具 | 十六进制与多编码字符串互转 |

## 目录结构

```
JTTools/
├── README.md
├── docker-compose.yml           # ← Docker 部署入口（在仓库根目录执行）
├── jttools_new.service          # systemd 托管示例
└── src/                         # ← Docker 构建上下文（context）就是这个目录
    ├── Dockerfile
    ├── .dockerignore
    ├── global.json
    ├── JTTools.sln
    ├── scripts/healthcheck.sh
    └── JTTools/                 # Web 应用
        ├── Controllers/         # 各协议解析接口（很薄，逻辑都在协议库里）
        ├── Configs/             # 各厂商/版本的协议配置
        ├── Dtos/
        └── wwwroot/             # 前端页面（Bootstrap + jQuery + axios，无构建工具）
```

> 依赖说明：JT808 / JT809 / JT1078 / JT905 / JTActiveSafety 均以 **NuGet 包**方式引用，
> 不需要协议源码即可构建。若要使用本地修改的协议库，见文末「常见问题」。

---

# 方式一：Docker 部署（推荐）

## 1. 前置条件

在 VPS 上安装 Docker 与 Compose 插件：

```bash
curl -fsSL https://get.docker.com | sh
sudo systemctl enable --now docker
docker version && docker compose version
```

## 2. 一键部署

镜像由 GitHub Actions 自动构建并推送到 `ghcr.io`（已设为公开），
VPS 上直接拉取运行，**不需要 .NET SDK，也不需要编译**。

```bash
cd JTTools              # 仓库根目录（docker-compose.yml 所在位置）

docker compose pull     # 拉取最新镜像（约 102 MB）
docker compose up -d    # 启动

# 查看状态与日志
docker compose ps
docker compose logs -f
```

启动后访问：

- 解析页面：`http://<VPS_IP>:18889/`
- 健康检查：`http://<VPS_IP>:18889/health`（返回 `Healthy`）
- Swagger：`http://<VPS_IP>:18889/jttui/swagger`

## 3. 端口说明

容器内部统一监听 **8080**，宿主机对外仍是 **18889**（和原来的 systemd 部署保持一致）。
需要换端口只改 `docker-compose.yml`：

```yaml
ports:
  - "8080:8080"   # 改成宿主机 8080
```

> `appsettings.json` 里写的是 `18889`，容器里用环境变量 `ASPNETCORE_URLS=http://+:8080`
> 覆盖（环境变量优先级高于 appsettings.json），所以不要再单独去掉这个环境变量。

## 4. 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `ASPNETCORE_ENVIRONMENT` | `Production` | 运行环境 |
| `ASPNETCORE_URLS` | `http://+:8080` | 监听地址，勿随意删除 |
| `TZ` | `Asia/Shanghai` | 容器时区 |
| `Logging__LogLevel__Default` | `Information` | 调成 `Debug` 可看详细日志 |

## 5. 常用运维命令

```bash
docker compose ps                             # 状态（含健康检查结果）
docker compose logs -f --tail=200             # 实时日志
docker compose restart                        # 重启
docker compose down                           # 停止并删除容器
docker compose pull && docker compose up -d   # 更新到最新镜像
docker compose exec jttools bash              # 进入容器排查
```

## 6. 更新部署

```bash
docker compose pull
docker compose up -d
```

想固定到某个版本，把 `docker-compose.yml` 里的 `latest` 换成具体标签：

```yaml
image: ghcr.io/yangye2/jttools:sha-ff57d0d   # 或 v1.0.0
```

旧镜像会残留，清理一下：

```bash
docker image prune -f
```

## 7. 反向代理（HTTPS）

容器只监听 HTTP，公网域名建议在最外层再加 Nginx / Caddy 做 TLS。

Nginx 示例（保留原站点的 `/jtt` 接口路径，前端 `site.js` 里的 `axios.defaults.baseURL`
就是 `/jtt`，所以**不要**改这个前缀）：

```nginx
server {
    listen 443 ssl http2;
    server_name jttools.example.com;

    ssl_certificate     /etc/letsencrypt/live/jttools.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jttools.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:18889;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10m;   # 解析大报文时按需调大
    }
}

server {
    listen 80;
    server_name jttools.example.com;
    return 301 https://$host$request_uri;
}
```

## 8. 国内网络加速（构建慢 / 拉取失败时）

> 默认的「拉取镜像」部署方式**不涉及**这一节，只有需要自己构建镜像时
> （第 10 节的方案 B / 方案 C）才用得上。

**Docker 基础镜像**：`Dockerfile` 使用的是 `mcr.microsoft.com`（微软镜像仓库），
通常可直连。若仍很慢，在 `/etc/docker/daemon.json` 配置镜像加速后 `systemctl restart docker`。

**NuGet 还原慢**：构建阶段会访问 `api.nuget.org`。可以给 Dockerfile 里的
`dotnet restore` 加一个镜像源参数，例如：

```dockerfile
RUN --mount=type=cache,target=/root/.nuget/packages \
    dotnet restore JTTools/JTTools.csproj \
        --source https://api.nuget.org/v3/index.json \
        --source https://mirrors.cloud.tencent.com/nuget/
```

> 注意：`Dockerfile` 刻意**没有**写 `# syntax=docker/dockerfile:1` 指令，
> 目的是避免构建时还要去 Docker Hub 拉取 frontend 镜像（国内经常拉不动）。
> `RUN --mount=type=cache` 由 Docker 自带的 BuildKit 支持，Docker 20.10+ 均可。

## 9. 可选：小内存 VPS 的「只拷贝产物」方案

如果 VPS 内存/磁盘紧张，不想在机器上装 1GB 的 SDK 镜像，可以本地（或 CI）
先发布，再把产物拷到 VPS 用下面的精简 Dockerfile 构建：

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY scripts/healthcheck.sh /app/scripts/healthcheck.sh
COPY publish/ ./
ENV ASPNETCORE_URLS=http://+:8080 ASPNETCORE_ENVIRONMENT=Production TZ=Asia/Shanghai
EXPOSE 8080
USER $APP_UID
ENTRYPOINT ["dotnet", "JTTools.dll"]
```

本地发布命令（**不要**加 `-p:PublishTrimmed=true`，原因见常见问题）：

```bash
cd src
dotnet publish JTTools/JTTools.csproj -c Release -o ./publish -r linux-x64 --self-contained false
```

---

## 10. 镜像体积与 VPS 磁盘/流量预估

先回答最容易搞混的一点：**SDK 镜像不会进最终镜像**。

`Dockerfile` 是多阶段构建，`sdk` 只在第一阶段用来编译，最后一行
`COPY --from=build /app/publish ./` 只把**编译产物**拷进 `aspnet` 运行时镜像。

实测数据：

| 项目 | 大小 | 说明 |
| --- | --- | --- |
| 应用发布产物 | **11 MB** | 84 个文件，这才是真正进镜像的东西 |
| `mcr.microsoft.com/dotnet/aspnet:10.0` | 拉取约 **91 MB** | 运行时镜像，最终镜像的底座 |
| `mcr.microsoft.com/dotnet/sdk:10.0` | 拉取约 **335 MB** | **仅构建阶段使用**，解压后约占 1 GB 磁盘 |
| **最终运行镜像** | **约 102 MB 下载 / 约 230 MB 磁盘** | 91 MB + 11 MB |

对比一下：本地开发装的 .NET SDK 是 748 MB —— 那是「造零件的机床」（编译器、MSBuild、
分析器、模板、多框架 packs），VPS 上跑服务完全不需要。

### 三种部署方式的 VPS 开销

| 方案 | VPS 下载量 | VPS 磁盘占用 | 适合 |
| --- | --- | --- | --- |
| **A. CI 构建好推到 ghcr.io，VPS 只 `pull`**（当前默认） | 约 102 MB | 约 230 MB | 推荐，VPS 上完全无 SDK |
| **B. 在 VPS 上 `docker compose up -d --build`** | 约 426 MB | 峰值约 1.3 GB，清理后约 230 MB | 不想依赖 ghcr.io |
| **C. 本地 `dotnet publish` 出 11 MB，scp 上去跑第 9 节方案** | 约 91 MB | 约 230 MB | 只想传 11 MB 产物 |

> 方案 A 就是 `docker-compose.yml` 的默认行为；方案 B 需要先把 compose 里的
> `image:` 注释掉、改用注释中的 `build:` 段；方案 C 见第 9 节。

只有方案 B 会在 VPS 上留下 SDK 镜像，构建完成后把不再需要的清掉：

```bash
# 清构建缓存
docker builder prune -f
# 清掉没被任何容器使用的镜像（包括 sdk、以及旧版本的 jttools）
docker image prune -a -f

docker system df        # 看实际占用
```

> 注意：`docker image prune -a` 会删掉所有未被使用的镜像，
> 如果 VPS 上还跑着其他服务，执行前先确认一下。

---

## 11. GitHub Actions 自动构建（已配置）

仓库里已经放好两个 workflow：

| 文件 | 作用 | 触发条件 |
| --- | --- | --- |
| `.github/workflows/dotnet.yml` | 还原 + 编译 + 发布，产物作为 Artifact 上传 | push / PR / 手动 |
| `.github/workflows/docker.yml` | 构建 Docker 镜像并推送到 ghcr.io | push / tag / PR / 手动 |

镜像标签由 `docker/metadata-action` 自动生成：

| 场景 | 生成的标签 |
| --- | --- |
| 推到默认分支 | `latest`、分支名、`sha-xxxxxxx` |
| 打 tag（如 `v1.0.0`） | `1.0.0`、`1.0`、`latest` |
| Pull Request | 只构建不推送（验证 Dockerfile 能不能过） |

> 两个 workflow 都配了 `concurrency`，同一分支连续 push 时会自动取消上一次未跑完的构建。

### 镜像地址

```
ghcr.io/yangye2/jttools:latest
```

实测已确认这个包是**公开**的，VPS 上无需 `docker login` 就能拉取。
当前可用标签：`latest`、`WebApi`、`sha-ff57d0d`。

> 如果以后把包改回私有，VPS 拉取前要登录一次：
> ```bash
> # 令牌在 GitHub → Settings → Developer settings → Personal access tokens 创建，勾选 read:packages
> echo <你的令牌> | docker login ghcr.io -u yangye2 --password-stdin
> ```

### 用镜像部署

`docker-compose.yml` **已经配好了**，`image:` 直接指向 ghcr.io，默认就是拉取模式：

```yaml
services:
  jttools:
    image: ghcr.io/yangye2/jttools:latest
```

```bash
docker compose pull
docker compose up -d
```

VPS 上只下载约 102 MB，也不会留下 1 GB 的 SDK 构建镜像。

> 如果要换成自己的仓库/用户名构建的镜像，修改 `.github/workflows/docker.yml`
> 里的 `IMAGE_NAME`（默认取 `github.repository_owner`，会自动跟随仓库所有者）
> 和 `docker-compose.yml` 里的 `image:` 即可。

### VPS 是 ARM 架构怎么办

`docker.yml` 里默认只构建 `linux/amd64`（CI 跑得快）。
如果 VPS 是 ARM（例如 Oracle Cloud / Ampere），把这行改成：

```yaml
platforms: linux/amd64,linux/arm64
```

构建会变慢（arm64 靠 QEMU 模拟），但两个架构都能用。

---

# 方式二：systemd 托管（原方案）

```bash
cp /home/jttools/jttools.service /etc/systemd/system/jttools.service
chmod u+x /home/jttools/jttools
systemctl daemon-reload

systemctl start  jttools.service
systemctl status jttools.service
systemctl stop   jttools.service
```

# 方式三：PM2 托管（原方案）

```bash
pm2 start "dotnet JTTools.dll ASPNETCORE_ENVIRONMENT=Production" \
    -n "JTTools.18889" \
    -o "/home/Logs/JTTools/out.log" \
    -e "/home/Logs/JTTools/error.log"
```

---

# 本地开发

```bash
cd src
dotnet run --project JTTools/JTTools.csproj
```

> 需要 **.NET 10 SDK**（`global.json` 已锁定 `10.0.100` + `rollForward: latestFeature`）。

---

# 常见问题

**Q：Docker 构建时报 `A compatible .NET SDK was not found. Requested SDK version: 10.0.100`？**

原 `global.json` 里只写了 `"version": "10.0.100"`，没写 `rollForward`，默认只接受
**10.0.1xx** 这个 SDK 小版本；而 `sdk:10.0` 镜像里带的是 **10.0.4xx**，所以直接构建失败。
本仓库已修正为：

```json
{
  "sdk": {
    "version": "10.0.100",
    "rollForward": "latestFeature"
  }
}
```

`latestFeature` 表示「10.0 大版本内，用最高的 SDK 小版本」，
这样 10.0.100 / 10.0.4xx 都能用，也和 `JT808` 仓库的写法保持一致。

**Q：改了外层 `JT808` / `JT809` / `JT1078` 仓库的源码，JTTools 里为什么不生效？**

因为 `JTTools.csproj` 用的是 `PackageReference`（NuGet 包），不是本地工程引用。三种做法：

1. 打包并发布到 NuGet / 私有源，再升级版本号（各仓库根目录有 `publish.bat`）。
2. 改成工程引用，例如：
   ```xml
   <!-- 代替 <PackageReference Include="JT808" Version="2.8.1" /> -->
   <ProjectReference Include="..\..\..\..\JT808\src\JT808.Protocol\JT808.Protocol.csproj" />
   ```
   但要保证目标框架兼容（JT808/JT809 有 net10.0，JT1078 只有 net6.0），
   并同步修改 `Dockerfile` 的构建上下文。
3. 把要改的协议工程直接加进 `JTTools.sln`。

**Q：能开 `PublishTrimmed` / AOT 让镜像更小吗？**

不建议。这些协议库大量使用**反射**扫描程序集来注册消息体
（`Config.Register(Assembly.GetExecutingAssembly())`），裁剪或 AOT 会把类型裁掉，
表现为「某个消息解析报未找到消息体」。发布脚本里的 `-p:PublishTrimmed=true`
在容器场景下请去掉。

**Q：容器启动后访问不到，日志报 `Connection refused`？**

先看端口映射和健康检查：

```bash
docker compose ps
curl -v http://127.0.0.1:18889/health
```

如果健康检查通过但访问不了，多半是 VPS 安全组 / 防火墙没放行 18889。

**Q：健康检查脚本为什么不用 curl？**

`.NET` 官方镜像里没有 `curl`/`wget`，安装需要联网 `apt`，国内容易失败。
`scripts/healthcheck.sh` 改用 bash 内置的 `/dev/tcp` 发 HTTP 请求，零依赖。

**Q：`/health` 端点会影响业务吗？**

不会，只是新增了一个只返回 `Healthy` 文本的 GET 路由，其余接口路径
（`/jtt/**`）完全不变。
