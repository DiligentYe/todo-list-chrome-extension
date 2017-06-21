(function() { // 计算各种性能数据
	var performance_data = {};

	// chrome.runtime.sendMessage({
	// 	name: "getWindow"
	// }, function(response) {
	// 	console.log(response);
	// });

	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {
			name: "getPerf"
		}, function(response) {
			var performance = response.performance.timing;
			var firstPaint = response.firstPaint;

			// 重定向次数
			performance_data.redirectCount = performance.redirectStart === 0 ? 0 : 1;

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

			render(performance_data);
		});
	});
})();

// 渲染数据
function render(data) {
	// 绘制折线图
	renderLineStack(data.timeline);

	// 绘制扇形图
	renderFanShape(data);

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

// 饼图
function renderFanShape(data) {
	// 基于准备好的dom，初始化echarts实例
	var myChart = echarts.init(document.getElementById('fanShape'));

	// 其他
	var other = data.allTime - data.domainLookup - data.connect - data.response - data.DOMReady - data.domContentLoad
	other = other >= 0 ? other : 0;

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
	var myChart = echarts.init(document.getElementById('lineStack'));

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

// 时间转换：将毫秒转换为秒
function msToS(ms) {
	return +((ms / 1000).toFixed(3).replace(/\..0*$/, ''));
}