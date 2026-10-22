# 暮里 MULI

暗色编辑式博客与本地内容后台。

## 本地完整版

```bash
cd outputs/site
python3 server.py 8080
```

打开 <http://127.0.0.1:8080>。

本地版包含：

- 首页与文章阅读
- 后台文字设置
- 文章管理
- 图片上传
- ONE RSS
- 通过本机服务在 Edge / Safari 之间同步

## GitHub Pages

仓库包含 `.github/workflows/pages.yml`，推送后可在 GitHub 仓库的 **Settings → Pages** 中选择 **GitHub Actions**。

GitHub Pages 是纯静态托管，无法运行 `server.py`。在线版本可以浏览页面和使用浏览器本地后台，但跨浏览器同步、RSS 代理需要另外部署 Python 服务。

