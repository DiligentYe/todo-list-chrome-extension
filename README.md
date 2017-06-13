# 浏览器插件————二维码生成器

## manifest.json特殊字段

1. browser_action: 插件为浏览器行为
2. permission: 允许使用tabs

## 所需文件

1. qr_popup.html 弹出层样式和基本结构
1. js/qr.js 调用生成二维码接口生成对应图片添加到弹出层上
