#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# JTTools 容器健康检查
#
# 刻意不依赖 curl / wget：.NET 官方镜像里没有这两个命令，装它们需要联网 apt，
# 在国内网络环境下容易失败。这里直接用 bash 内置的 /dev/tcp 发一个 HTTP 请求。
#
# 可用环境变量覆盖：
#   HEALTHCHECK_HOST   默认 127.0.0.1
#   HEALTHCHECK_PORT   默认 8080
#   HEALTHCHECK_PATH   默认 /health
# ---------------------------------------------------------------------------
set -uo pipefail

HOST="${HEALTHCHECK_HOST:-127.0.0.1}"
PORT="${HEALTHCHECK_PORT:-8080}"
HTTP_PATH="${HEALTHCHECK_PATH:-/health}"

fail() {
    echo "healthcheck failed: $*" >&2
    exit 1
}

# 建立 TCP 连接 -> 发送 HTTP/1.0 请求（Connection: close 让服务端读完主动断开）-> 读取全部响应
# 子 shell 里屏蔽 bash 原始的连接错误输出，统一由下面的 fail() 报告
response="$(
    exec 2>/dev/null
    exec 3<>"/dev/tcp/${HOST}/${PORT}" || exit 1
    printf 'GET %s HTTP/1.0\r\nHost: %s\r\nConnection: close\r\n\r\n' "${HTTP_PATH}" "${HOST}" >&3
    cat <&3
)" || fail "无法连接 http://${HOST}:${PORT}${HTTP_PATH}"

case "${response}" in
    *" 200 "*) exit 0 ;;
    *) fail "http://${HOST}:${PORT}${HTTP_PATH} 返回非 200：${response}" ;;
esac
