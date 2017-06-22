# 浏览器插件————页面加载性能插件

## 待分析的性能指标

### 页面加载总时间
    从开始请求页面到页面onload事件触发执行后的时间

### 域名解析时间
    performance.timing.domainLookupEnd - performance.timing.domainLookupStart

### TCP连接时间
    performance.timing.connectEnd - performance.timing.connectStart

### 响应时间
    performance.timing.responseEnd - performance.timing.responseStart

### 首字节时间
    从开始请求页面到获取响应的第一个字节的时间
    performance.timing.responseStart - performance.timing.navigationStart

### 首次渲染
    开始渲染页面时间
    chrome.loadTimes().firstPaintTime * 1000 - performance.timing.navigationStart

### DOM解析时间（DOMReady）
    从页面开始解析，DOM构建完毕
    performance.timing.domContentLoadedEventStart - performance.timing.domLoading

### DOMContentload事件
    页面DOM结构解析完成，domContentLoadEvent事件触发

### load事件
    页面所有资源加载完毕，load事件触发
    performance.timing.domComplete - performance.timing.navigationStart

### 静态资源分析项目

#### 重定向次数
#### 各种资源数量
#### 各种资源总传输体积
#### 各类资源展示


## 遇到的问题
1. 如何获取页面performance对象
    通过content_scripts，来操作页面内容。 
    在popup中，利用chrome.runtime.sendMessage请求数据
    在content_scripts中，利用chrome.runtime.onMessage.addListener将当前页面内容返回给sendMessage

    <em>注：</em> 当在下拉列表中使用chrome.runtime.sendMessage，需要选中当前标签

2. popup页面不可以添加内嵌的script
    将所有的js写在文件中

3. chrome插件中响应头中定义了Content Security Policy，defualt-src 为 self，因此不能执行eval这种不安全的语句（自定义模版中使用eval来执行自定义字符串）

4. 变量作用域问题
    在函数中为全局变量添加属性，在函数外失效

5. echarts 如何设置图的颜色
    在options中添加一个color数组，直接添加颜色

6. domContentLoad事件和load事件
    domContentLoad，表示DOM结构解析完毕，DOM在解析过程中，如果遇到脚本，必须等到脚本执行完之后才能继续进行DOM解析，而样式文件会阻塞脚本的执行，但是图片等资源的加载不会阻塞DOM结构解析，因此在DOM结构解析完成后，同步的脚本文件和样式文件都已经加载完成，但是图片等文件只有在load事件触发之前才加载完毕。


    

