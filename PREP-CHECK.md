# Hugo 发布准备检查记录

- Hugo 版本目标：Extended 0.166.0
- 本机 `hugo version`：未通过（未安装 Hugo）
- 本机 `docker --version`：未通过（未安装 Docker）
- `hugo.toml` TOML 解析：通过（Python tomllib）
- GitHub Actions：已检查包含 Hugo Extended、`public/` artifact 和 `actions/deploy-pages@v4`
- `static/CNAME`：存在，内容 `www.xiaominart.com`
- `static/robots.txt`：存在，Disallow 全站
- 真实 GitHub Pages 构建：未测，需推送独立仓库后由 Actions 执行
- GitHub Pages 站点：未创建
- Cloudflare：未绑定
- 阿里云 nameserver/DNS：未修改
- 正式域名：未发布
- 真实支付：未接入

结论：**准备文件完成，实际构建和发布待 CI/账号授权，正式上线未执行。**
