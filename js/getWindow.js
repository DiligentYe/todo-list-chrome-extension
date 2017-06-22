console.log(window.performance.timing);

chrome.runtime.onMessage.addListener(function(message, sender, Response) {
	if (message.name == 'getPerf') {
		console.log(window.performance.getEntries());
		Response({
			performance: window.performance,
			firstPaint: chrome.loadTimes().firstPaintTime * 1000,
			resource: window.performance.getEntries()
		});
	}
});