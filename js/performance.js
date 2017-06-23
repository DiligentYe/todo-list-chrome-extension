(function() { // 计算各种性能数据
	var performance_data = {};


	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {
			name: "getPerf"
		}, function(response) {
			var performance = response.performance.timing;
			var firstPaint = response.firstPaint;

			// 域名解析时间
			performance_data.domainLookup = msToS(performance.domainLookupEnd - performance.domainLookupStart);

			// TCP建立时间
			performance_data.connect = msToS(performance.connectEnd - performance.connectStart);

			// 请求建立时间
			performance_data.request = msToS(performance.responseStart - performance.requestStart);

			// 响应时间
			performance_data.response = msToS(performance.responseEnd - performance.responseStart);

			// 网络处理时间
			performance_data.network = msToS(performance.domLoading - performance.navigationStart);

			// DOMReady时间
			performance_data.DOMReady = msToS(performance.domContentLoadedEventStart - performance.domLoading);

			// 获取外部资源所用时间
			performance_data.domContentLoad = msToS(performance.domContentLoadedEventEnd - performance.domContentLoadedEventStart);

			// 整个加载过程
			performance_data.allTime = msToS(performance.loadEventEnd - performance.navigationStart);

			//load事件触发
			performance_data.loadEvent = msToS(performance.domComplete - performance.navigationStart);

			// 首次渲染时间/白屏时间
			performance_data.paintTime = msToS(firstPaint - performance.navigationStart);

			// 各个时间点
			performance_data.timeline = [{
				marker: 'first Byte',
				time: msToS(performance.responseStart - performance.navigationStart)
			}, {
				marker: 'parse HTML',
				time: msToS(performance.domLoading - performance.navigationStart)
			}, {
				marker: 'first Paint',
				time: performance_data.paintTime
			}, {
				marker: 'domContentLoad',
				time: msToS(performance.domContentLoadedEventStart - performance.navigationStart)
			}, {
				marker: 'load',
				time: msToS(performance.domComplete - performance.navigationStart)
			}, {
				marker: 'end',
				time: msToS(performance.loadEventEnd - performance.navigationStart)
			}];

			// 	// 静态资源
			var resource = response.resource;


			// 重定向次数
			var redirectCount = 0;
			// 各类资源个数统计
			var resourceNum = [];

			var resourceCount = [];
			resourceCount.redirectCount = 0;
			resourceCount.imgNum = 0;
			resourceCount.cssNum = 0;
			resourceCount.jsNum = 0;
			resourceCount.docNum = 0;
			resourceCount.otherNum = 0;

			for (var i = 0; i < resource.length; ++i) {
				resourceCount.push({});
				// 链接地址
				resourceCount[i].url = resource[i].name;

				// 文件名 
				resourceCount[i].name = resource[i].name.replace(/https?:\/\/(.*\/)*/, '');

				// 开始请求事件
				resourceCount[i].startTime = resource[i].startTime;

				// 总时长
				resourceCount[i].during = msToS(resource[i].duration);

				// 域名解析时间
				resourceCount[i].domainLookup = msToS(resource[i].domainLookupEnd - resource[i].domainLookupStart);

				// 请求时间
				resourceCount[i].request = msToS(resource[i].responseStart - resource[i].requestStart);

				// 响应时间
				resourceCount[i].response = msToS(resource[i].responseEnd - resource[i].responseStart);

				// 类型
				switch (resourceCount[i].name.replace(/.*\./, '')) {
					case 'jpg':
					case 'jpeg':
					case 'png':
					case 'gif':
					case 'webp':
						resourceCount[i].type = 'img';
						resourceCount.imgNum++;
						break;
					case 'js':
						resourceCount[i].type = 'js';
						resourceCount.jsNum++;
						break;
					case 'css':
						resourceCount[i].type = 'css';
						resourceCount.cssNum++;
						break;
					default:
						if (resource[i].initiatorType == 'xmlhttprequest') {
							resourceCount[i].type = 'doc';
							resourceCount.docNum++;
						} else {
							resourceCount[i].type = 'other';
							resourceCount.otherNum++;
						}
						break;
				}

				// 是否本地缓存
				resourceCount[i].isCache = (resource[i].fetchStart == resource[i].responseStart);
				console.log(resourceCount[i].isCache);

				resourceCount.redirectCount = resource[i].redirectStart == 0 ? resourceCount.redirectCount : resourceCount.redirectCount + 1;
			}

			performance_data.resourceCount = resourceCount;

			render(performance_data);

			// 挂载事件
			listener(performance_data.resourceCount);

		});

	});
})();

// 渲染数据
function render(data) {
	// 绘制折线图
	renderLineStack(data.timeline);

	// 绘制扇形图
	renderFanShape(data);

	// 绘制表格1
	renderTimeTable(data);

	//  绘制表格2
	renderResource(data.resourceCount);

	// console.log(data);
	// console.log(data.DOMReady_time);
	// var html = '';
	// html += '<span>redirectCount时间：</span><span>' + data.redirectCount + '</span><br/>';
	// html += '<span>domainLookup时间：</span><span>' + data.domainLookup + '</span><br/>';
	// html += '<span>connect时间：</span><span>' + data.connect + '</span><br/>';
	// html += '<span>request时间：</span><span>' + data.request + '</span><br/>';
	// html += '<span>response时间：</span><span>' + data.response + '</span><br/>';
	// html += '<span>DOM时间：</span><span>' + data.DomCssom + '</span><br/>';
	// html += '<span>renderTree时间：</span><span>' + data.renderTree + '</span><br/>';
	// html += '<span>DOMReady时间：</span><span>' + data.DOMReady + '</span><br/>';

	// var test = document.getElementById('test');
	// test.innerHTML = html;
}

/* 绘图函数 */
// 绘制表格2
function renderResource(resourceCount) {
	var resourceTable = document.getElementById('tableBody');
	var resourceTableHtml = '';

	for (var i = 0; i < resourceCount.length; ++i) {
		resourceTableHtml += '<div class="table-tr">';
		resourceTableHtml += '	<div class="table-td">' + (i + 1) + '</div>';
		resourceTableHtml += '	<div class="table-td resource-name">' + resourceCount[i].name + '</div>';
		resourceTableHtml += '	<div class="table-td">' + resourceCount[i].type + '</div>';
		resourceTableHtml += '	<div class="table-td resource-url">' + resourceCount[i].url + '</div>';
		resourceTableHtml += '	<div class="table-td">' + resourceCount[i].domainLookup + '</div>';
		resourceTableHtml += '	<div class="table-td">' + resourceCount[i].request + '</div>';
		resourceTableHtml += '	<div class="table-td">' + resourceCount[i].response + '</div>';
		resourceTableHtml += '	<div class="table-td">' + resourceCount[i].during + '</div>';
		resourceTableHtml += '	<div class="table-td">' + (resourceCount[i].isCache ? '是' : '否') + '</div>';
		resourceTableHtml += '</div>';
	}

	resourceTable.innerHTML = resourceTableHtml;
}

// 绘制表格1
function renderTimeTable(timing) {
	var dataTable = document.getElementById('data_sum');
	var dataTableHtml = dataTable.innerHTML;

	// 其他
	var other = timing.allTime - timing.domainLookup - timing.connect - timing.response - timing.DOMReady - timing.domContentLoad
	other = other >= 0 ? (Math.round(other * 1000) / 1000).toFixed() : 0;

	var data = [{
		value: timing.domainLookup,
		name: '域名解析'
	}, {
		value: timing.connect,
		name: 'TCP建立'
	}, {
		value: timing.response,
		name: '响应'
	}, {
		value: timing.DOMReady,
		name: 'DOMReady'
	}, {
		value: timing.domContentLoad,
		name: '图片等资源加载'
	}, {
		value: other,
		name: '其他'
	}];

	for (var i = 0; i < data.length; ++i) {
		dataTableHtml += '<div class="table-tr">';
		dataTableHtml += '<div class="table-td">' + data[i].name + '</div>';
		dataTableHtml += '<div class="table-td">' + data[i].value + '</div>';
		dataTableHtml += '</div>';
	}

	dataTable.innerHTML = dataTableHtml;
}

// 饼图
function renderFanShape(data) {
	// 基于准备好的dom，初始化echarts实例
	var myChart = echarts.init(document.getElementById('fanShape_sum'));

	// 其他
	var other = data.allTime - data.domainLookup - data.connect - data.response - data.DOMReady - data.domContentLoad
	other = other >= 0 ? other.toFixed(3) : 0;

	// 指定图表的配置项和数据
	var option = {
		title: {
			text: '加载时间分配图'
		},
		color: ['#26a1ff', '#ffaa01', '#fb0365', '#ffcc43', '#dc48f8', '#b0dc00'],
		series: [{
			name: '加载时间分配图',
			type: 'pie',
			radius: '55%',
			data: [{
				value: data.domainLookup,
				name: '域名解析'
			}, {
				value: data.connect,
				name: 'TCP建立'
			}, {
				value: data.response,
				name: '响应'
			}, {
				value: data.DOMReady,
				name: 'DOMReady'
			}, {
				value: data.domContentLoad,
				name: '图片等资源加载'
			}, {
				value: other,
				name: '其他'
			}]
		}]
	};
	// 使用刚指定的配置项和数据显示图表。
	myChart.setOption(option);
}

// 绘制性能折线图
function renderLineStack(timeline) {
	// 基于准备好的dom，初始化echarts实例
	var myChart = echarts.init(document.getElementById('lineStack_sum'));

	// 指定图表的配置项和数据
	var option = {
		title: {
			text: '页面性能折线图'
		},
		color: ['#26a1ff'],
		tooltip: {
			trigger: 'axis'
		},
		legend: {
			data: ['加载时间轴']
		},
		grid: {
			left: '3%',
			right: '4%',
			bottom: '3%',
			containLabel: true
		},
		toolbox: {
			feature: {
				saveAsImage: {}
			}
		},
		yAxis: {
			type: 'category',
			boundaryGap: false,
			data: []
		},
		xAxis: {
			type: 'value'
		},
		series: [{
			name: '开始到当前阶段距时间',
			type: 'line',
			stack: '总量',
			data: []
		}]
	};

	for (var i = 0; i < timeline.length; ++i) {
		option.yAxis.data.push(timeline[i].marker);
		option.series[0].data.push(timeline[i].time);
	}

	// 使用刚指定的配置项和数据显示图表。
	myChart.setOption(option);
}

/* 交互行为 */
/* 表格行为 */
// 显示下拉列表
function showList() {
	var downlist = document.getElementById('downlist');
	downlist.style.display = 'block';
}

// 隐藏下拉列表
function hideList() {
	var downlist = document.getElementById('downlist');
	downlist.style.display = 'none';
}

// 注册事件
function listener(data, resourceTable, resourceTableHtml) {
	var selectType = document.getElementById('selectType');
	var showResource = document.getElementById('showResource');

	// 显示或隐藏下拉列表
	selectType.addEventListener('mouseover', function(event) {
		showList();
	}, false);

	selectType.addEventListener('mouseout', function(event) {
		hideList();
	}, false);


	showResource.addEventListener('click', function(event) {
		// 选择类型
		var type = event.target.getAttribute('data-type');
		// 排序类型
		var sortType = event.target.getAttribute('data-sort');
		// 排序依据的属性
		var sortProp = event.target.getAttribute('data-prop');

		var handleDatas = [];

		// 点击下拉列表元素
		if (type) {
			handleDatas = downlistClick(data, type, resourceTable, resourceTableHtml);
		}

		// 点击排序按钮
		if (sortType) {
			handleDatas = sortByKey(data, sortProp, sortType, event.target)

		}

		// 更新表格数据
		renderResource(handleDatas, resourceTable, resourceTableHtml);


		// 关闭下拉菜单
		hideList();


	}, false);

	// 点击可排序属性
	// 
}

// 
function downlistClick(data, type, resourceTable, resourceTableHtml) {
	if (type == 'all') {
		return data;
	} else {
		return filterByKey(data, 'type', type);
	}

}


// 根据相应的键值进行排序
function sortByKey(arrs, key, type, DOM) {
	if (type == 'normal' || type == 'dec') {
		DOM.setAttribute('data-sort', 'inc');
		return arrs.sort(compareInc(key));

	} else {
		DOM.setAttribute('data-sort', 'dec');
		return arrs.sort(compareDec(key));
	}
}

/* 工具函数 */
// 时间转换：将毫秒转换为秒
function msToS(ms) {
	return +((ms / 1000).toFixed(3).replace(/\..0*$/, ''));
}

// 根据键值筛选数据函数
function filterByKey(arrs, key, value) {
	return arrs.filter(function(item, index) {
		return item[key] == value;
	});
}

// 两个sort函数

function compareInc(prop) {
	return function(a, b) {
		return a[prop] - b[prop];
	}
}

function compareDec(prop) {
	return function(a, b) {
		return b[prop] - a[prop];
	}
}


// 八进制转十进制
function octToDec(oct) {
	var dec = 0;
	var index = 0;
	while (oct) {
		mod = oct % 10;
		oct = Math.floor(oct / 10);
		dec += mod * Math.pow(8, index++);
	}
	return dec;
}