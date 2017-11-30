/* 获取输入输入框中的主机和端口号 */
var ip,
	port;

/* 获取相应的DOM节点 */
var ipDOM = document.getElementById('localhost');
var portDOM = document.getElementById('port');

var debug = document.getElementById('debug');

// 调试按钮事件
debug.addEventListener('click', getInfo);

/**
 * 获取页面中输入框的值，并将其拼接为url，然后请求调试数据
 * @return {[type]} [description]
 */
function getInfo() {
	// 调试数据地址
	var jsonUrl = '';

	// 输入框value
	ip = ipDOM.value;
	port = portDOM.value;

	jsonUrl = 'http://' + ip + ':' + port + '/json/list';

	// 获取请求数据，并执行相应的回调
	getJSON(jsonUrl, {
		success: openTab,
		failure: failure
	});
}

/**
 * 获取调试数据
 * @param  {string} url     调试数据所在链接
 * @param  {object} options 包括成功获取数据后的回调函数和失败的回调函数
 * @return {[type]}         [description]
 */
function getJSON(url, options) {
	var data;
	var tabUrl;

	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
				data = xhr.responseText;
				tabUrl = JSON.parse(data)[0]['devtoolsFrontendUrl'];
				options.success(tabUrl);
			} else {
				options.failure();
			}
		}
	}

	xhr.open('get', url, true);

	xhr.send(null);
}

/**
 * 创建一个标签页，打开指定url
 * @param  {string} url 调试面板的url
 * @return {[type]}     [description]
 */
function openTab(url) {
	chrome.tabs.create({
		url: url,
		active: true
	}, function(tab) {
		console.log(tab);
	});
}

/**
 * 获取数据失败后，弹出弹出层，并且绑定相应的事件
 * @return {[type]} [description]
 */
function failure() {
	var markerC = document.getElementById('markerC');
	var marker = document.getElementById('marker');

	var close = document.getElementById('close');

	// 显示弹出层
	markerC.style.display = 'block';

	// 添加关闭动作
	markerC.addEventListener('click', function markerCHandler(event) {
		if (event.target == markerC) {
			// 关闭弹出层
			markerC.style.display = 'none';
			// 清空监听器
			markerC.removeEventListener('click', markerCHandler);
		}
	});

	close.addEventListener('click', function closeCHandler(event) {
		// 关闭弹出层
		markerC.style.display = 'none';
		// 清空监听器
		markerC.removeEventListener('click', closeCHandler);
	});
}