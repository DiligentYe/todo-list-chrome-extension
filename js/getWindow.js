console.log(window.performance.timing);

chrome.runtime.onMessage.addListener(function(message, sender, Response) {
	if (message.name == 'getPerf') {
		Response({
			performance: window.performance,
			firstPaint: chrome.loadTimes().firstPaintTime * 1000
		});
	}
});