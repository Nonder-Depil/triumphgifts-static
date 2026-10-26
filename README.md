# site_slim/ —— 瘦身部署版

这是 `site/` 的云端部署版本，供上传托管用。

| | site/（原版） | site_slim/（本目录） |
|---|---|---|
| 总体积 | ~1089 MB | **272 MB** |
| 图片格式 | JPG/PNG 原图 | WebP（q=80，最长边 ≤1920px） |
| 图片体积 | 817 MB | 151 MB（省 82%） |
| 页面数 | 1081 | 1081（内容逐字节一致，仅图片引用改为 .webp） |

## 生成方式

```
build/07_slim_analyze.py   引用扫描 -> data/slim_report.json
build/09_slim_convert.py   转码 WebP + 引用改写映射 -> data/webp_map.json
build/10_package_slim.py   重建到本目录（引用改写 60632 条）
build/11_verify_slim.py    引用完整性校验
```

原 JPG/PNG 保留在 `site/assets/`（转码是**有损**的，原版是画质基准，不要删）。

## 已知遗留（与瘦身无关，原版同样存在）

部分 srcset 尺寸变体（`-600x400`、`-1536x768`、`-18x12` 等约 2.3 万条引用）
在抓取阶段就没有对应文件，浏览器会自动回退到主图，页面显示正常。
如需补齐，可从原站按 sitemap 重抓这些变体。

## 部署

整目录上传即可。服务器需正确返回 `.webp` 的 `Content-Type: image/webp`
（nginx/Apache/主流托管平台默认支持）。
