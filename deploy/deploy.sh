#!/usr/bin/env bash
# ═════════════════════════════════════════════════════════════
# 发布到阿里云服务器（在**本地**执行，不是在服务器上）
#
#   bash deploy/deploy.sh root@47.x.x.x
#
# 前提：
#   · 服务器已跑过 deploy/bootstrap.sh
#   · 本地能 ssh 到服务器（密钥或密码）
#
# 为什么在本地 build 而不是服务器 build：
#   Astro 构建峰值要 1GB+ 内存，2 核 2G 的轻量服务器容易 OOM。
#   本地 build 完只传 40MB 静态产物，更快也更可控。
# ═════════════════════════════════════════════════════════════
set -euo pipefail

TARGET="${1:?用法: bash deploy/deploy.sh root@<服务器IP>}"
APP_DIR=/var/www/xiaominart

KS_VERSION=$(node -p "require('./package.json').dependencies['@keystatic/core']")

echo "── 1/6 构建静态站 ──"
NODE_OPTIONS="" npm run build

echo "── 2/6 打包 API ──"
node server/build.mjs

echo "── 3/6 生成 nginx 重定向规则 ──"
node deploy/gen-nginx-redirects.mjs

echo "── 4/6 上传静态产物 ──"
# 用 tar over ssh 而不是 rsync：Windows 的 Git Bash 常没有 rsync
tar -czf - dist | ssh "$TARGET" "mkdir -p $APP_DIR && rm -rf $APP_DIR/dist.new && mkdir -p $APP_DIR/dist.new && tar -xzf - -C $APP_DIR/dist.new --strip-components=1 && rm -rf $APP_DIR/dist.old && mv $APP_DIR/dist $APP_DIR/dist.old 2>/dev/null || true; mv $APP_DIR/dist.new $APP_DIR/dist"

echo "── 5/6 上传 API 与配置 ──"
tar -czf - -C server dist index.mjs build.mjs | ssh "$TARGET" "mkdir -p $APP_DIR/server && tar -xzf - -C $APP_DIR/server --strip-components=1"

scp -q deploy/nginx.conf             "$TARGET:/tmp/xiaominart-nginx.conf"
scp -q deploy/security-headers.conf  "$TARGET:/tmp/xiaominart-security.conf"
scp -q deploy/redirects.conf         "$TARGET:/tmp/xiaominart-redirects.conf"
scp -q deploy/xiaominart-api.service "$TARGET:/tmp/xiaominart-api.service"

ssh "$TARGET" bash -s <<REMOTE
set -e
mkdir -p /etc/nginx/snippets
cp /tmp/xiaominart-security.conf /etc/nginx/snippets/
cp /tmp/xiaominart-redirects.conf /etc/nginx/snippets/
cp /tmp/xiaominart-nginx.conf /etc/nginx/sites-available/xiaominart
ln -sf /etc/nginx/sites-available/xiaominart /etc/nginx/sites-enabled/xiaominart
rm -f /etc/nginx/sites-enabled/default
cp /tmp/xiaominart-api.service /etc/systemd/system/xiaominart-api.service
chown -R xiaominart:xiaominart $APP_DIR
chown xiaominart:xiaominart /etc/systemd/system/xiaominart-api.service 2>/dev/null || true

# Keystatic 后台的运行时依赖（bundle 时标为 external，只需这一个包）
if [ ! -d $APP_DIR/node_modules/@keystatic/core ]; then
  echo "安装 @keystatic/core $KS_VERSION …"
  cd $APP_DIR && npm install --omit=dev --no-audit --no-fund @keystatic/core@$KS_VERSION
fi
REMOTE

echo "── 6/6 重启服务 ──"
ssh "$TARGET" "systemctl daemon-reload && systemctl restart xiaominart-api && nginx -t && systemctl reload nginx"

sleep 2
echo
echo "── 健康检查 ──"
ssh "$TARGET" "curl -s http://127.0.0.1:8787/api/health" || echo "⚠️ API 未响应，看日志：journalctl -u xiaominart-api -n 50"

echo
echo "✅ 发布完成"
echo "   静态站：http://<服务器IP>/"
echo "   接口健康：http://<服务器IP>/api/health"
echo "   看日志：ssh $TARGET 'journalctl -u xiaominart-api -f'"
