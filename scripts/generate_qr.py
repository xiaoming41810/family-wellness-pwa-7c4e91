#!/usr/bin/env python3
"""生成部署网址二维码：python scripts/generate_qr.py https://用户名.github.io/仓库名/"""
import sys
try:
    import qrcode
except ImportError:
    raise SystemExit("请先运行：python -m pip install qrcode[pil]")
if len(sys.argv) != 2 or not sys.argv[1].startswith("https://"):
    raise SystemExit("用法：python scripts/generate_qr.py https://您的网站地址/")
img=qrcode.make(sys.argv[1]);img.save("site-qrcode.png")
print("已生成 site-qrcode.png")
