(function qrCode() {
	chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
     	// 获取当前页面的url
		var url = '';
		url = tabs[0].url;
		console.log(url);

		var api = 'http://pan.baidu.com/share/qrcode?w=300&h=300&url=' + url;
	
		// 生成挂载点
		var marker = document.getElementById('qr_code');
		console.log(marker);
	
		// 将图片添加到挂载点上
		var str = '<img src="' + api + '" alt="" id="qr_img">';
		marker.innerHTML = str;
    });
})();