# 每日热量与三大营养素计算器

面向手机和家庭成员的纯静态 PWA 网站。无需注册或后端，身体数据只保存在当前浏览器。在线打开一次后可离线计算。

## 开发者如何运行

项目没有构建步骤和运行时依赖。在项目目录执行：

```powershell
python -m http.server 8080
```

打开 `http://localhost:8080/`。不要双击 `index.html`，因为 Service Worker 和 ES 模块需要 HTTP/HTTPS。算法测试页面为 `http://localhost:8080/tests/test.html`，页面底部应显示“16 通过，0 失败”。

目录说明：`js/config.js` 放范围和系数，`js/calculator.js` 放全部公式，`js/storage.js` 处理本机存储，`js/app.js` 负责界面。详细公式见 [ALGORITHM.md](ALGORITHM.md)。

## 普通用户如何免费部署

最简单方案是 GitHub Pages：

1. 在 GitHub 新建公开仓库，把本项目文件上传或推送到 `main` 分支。
2. 仓库 **Settings → Pages → Source** 选择 **GitHub Actions**。
3. 打开仓库的 **Actions**，等待 `Deploy static PWA to GitHub Pages` 变绿；网址通常为 `https://用户名.github.io/仓库名/`。

以后推送到 `main` 会自动部署。仓库当前没有远程地址，本项目没有替您提交、推送或发布。GitHub Pages 自动提供 HTTPS。

得到网址后，可安装二维码依赖并生成图片：

```powershell
python -m pip install "qrcode[pil]"
python scripts/generate_qr.py https://用户名.github.io/仓库名/
```

生成的 `site-qrcode.png` 可直接发给家人。由于部署网址尚不存在，项目不能预先生成有效的最终访问二维码。

## 老人如何使用

1. 扫二维码或点击链接，按“大按钮”依次填写年龄、性别、身高体重、活动和目标。
2. 点击“计算我的建议”，先看每天热量和蛋白质、脂肪、碳水三个大卡片。
3. 想放到桌面：安卓点“添加到手机桌面”；iPhone 用 Safari 的“分享 → 添加到主屏幕”。微信里可以直接算；安装时请在系统浏览器打开。

高级设置、分餐和体重校准都可不填。已填信息会自动保存在当前设备。

## 更新版本

修改代码后更新 `sw.js` 顶部的 `VERSION`（例如 `nutrition-v1.0.1`），再推送。打开的旧页面发现新版本时会显示“立即更新”；Service Worker 会删除旧版本缓存，避免长期使用旧文件。

## 清除本地数据

页面底部点“清除我的数据”，再确认。仅恢复输入默认值可点“恢复默认设置”。清除浏览器网站数据也会移除记录和离线缓存。

## 隐私、安全与限制

- 不含账号、广告、分析追踪、数据库或网络上传代码。
- 页面设置了 `noindex`、`nofollow`，并提供禁止抓取的 `robots.txt`。这只能降低网站被搜索引擎收录的概率，不能实现密码保护；任何拿到网址的人仍可能访问。
- 仅适合一般成年人的日常估算，不是诊断或个体化处方。
- 未满18岁、孕期/哺乳期、肾肝疾病、使用降糖药或胰岛素、进食障碍史、极端体重指数、近期快速变化或已有营养医嘱者，应咨询医生或注册营养师。
- iOS/微信的 PWA 安装入口由浏览器控制，网页无法自动弹出；计算与保存仍可使用。
- 动态校准依赖诚实、连续的平均摄入和周期平均体重；短期水分变化仍会影响结果。
- PWA 安装和离线能力需 HTTPS（localhost 开发环境除外）。
