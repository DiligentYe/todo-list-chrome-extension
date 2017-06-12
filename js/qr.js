(function qrCode() {
	console.log(11);
	// 获取当前页面的url
	var url = window.location.href;

	console.log(url);
	// var api = 'http://pan.baidu.com/share/qrcode?w=300&h=300&url=' + url;

	// 生成挂载点
	var marker = document.getElementById('#qr_code');
	div.id = 'qr_code';

	// 将图片添加到挂载点上
	var str = '<img src="" alt="' + url + '" id="qr_img">';
	div.innerHTML = str;


	// 点击删除弹层
	marker.addEventListener('click', function(e) {
		e.stopPropagation();
		if (e.target.id == 'qr_code') {
			document.body.removeChild(marker);
		}
	}, false);

})();