# ═════════════════════════════════════════════════════════════
# 服务器一次性初始化（Ubuntu 22.04）
#
# 在服务器上以 root 跑一次：
#   bash bootstrap.sh
#
# 做的事：装 Node 22 + nginx、建目录、装 systemd 服务、开防火墙。
# 只跑一次；以后发版用 deploy.sh。
# ═════════════════════════════════════════════════════════════
set -euo pipefail

APP_DIR=/var/www/xiaominart
API_USER=xiaominart

echo "── 1/6 系统更新 ──"
apt-get update -y
apt-get install -y curl ca-certificates gnupg rsync

echo "── 2/6 安装 Node 22 ──"
if ! command -v node >/dev/null || [[ "$(node -v)" != v22* ]]; then
  # 官方源在国内偶尔慢；若卡住可换阿里云镜像：
  #   curl -fsSL https://mirrors.aliyun.com/nodesource/setup_22.x | bash -
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
node -v && npm -v

echo "── 3/6 安装 nginx ──"
apt-get install -y nginx

echo "── 4/6 建目录与运行用户 ──"
# 独立系统用户跑 Node：不给登录 shell，最小权限
id -u "$API_USER" >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin "$API_USER"

mkdir -p "$APP_DIR"/{dist,server,node_modules}
chown -R "$API_USER:$API_USER" "$APP_DIR"
chmod 750 "$APP_DIR"

# .env 只有运行用户能读（里面有表单密钥、飞书 webhook）
touch "$APP_DIR/.env"
chown "$API_USER:$API_USER" "$APP_DIR/.env"
chmod 600 "$APP_DIR/.env"

echo "── 5/6 安装 systemd 服务 ──"
cp /tmp/xiaominart-api.service /etc/systemd/system/xiaominart-api.service
systemctl daemon-reload
systemctl enable xiaominart-api

echo "── 6/6 nginx 站点配置 ──"
mkdir -p /etc/nginx/snippets
# 这两个文件由 deploy.sh 上传到 /tmp，首次部署时才会存在；
# 若此刻还没有，先跳过，等第一次 deploy.sh 执行完再 reload。
if [[ -f /tmp/xiaominart-security.conf ]]; then
  cp /tmp/xiaominart-security.conf /etc/nginx/snippets/
fi
if [[ -f /tmp/xiaominart-redirects.conf ]]; then
  cp /tmp/xiaominart-redirects.conf /etc/nginx/snippets/
fi
if [[ -f /tmp/xiaominart-nginx.conf ]]; then
  cp /tmp/xiaominart-nginx.conf /etc/nginx/sites-available/xiaominart
  ln -sf /etc/nginx/sites-available/xiaominart /etc/nginx/sites-enabled/xiaominart
  rm -f /etc/nginx/sites-enabled/default
fi

nginx -t && systemctl reload nginx || echo "⚠️ nginx 配置未就绪（缺 snippet），等首次 deploy.sh 后再 reload"

echo
echo "✅ 初始化完成"
echo "   下一步：把 server/.env.example 复制成 $APP_DIR/.env 并填入密钥"
echo "   然后本地跑 ./deploy/deploy.sh"
