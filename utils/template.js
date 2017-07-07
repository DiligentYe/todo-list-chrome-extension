/**
 * 自定义模版解析器————将html模版解析为html结构
 * @type {Object}
 */
var template = {
	// 存放解析后的js字符串，执行该脚本会向全局注入globalStr变量
	jsStr: "var globalStr = '';",

	/**
	 * 将模版中的字符串解析为可执行的js语句
	 * @param  {string} tpl 模版字符串
	 */
	complileTpl: function(id) {
		// 模版文件
		var tpl = document.getElementById(id);

		// 模版文件中内容
		var html = tpl.innerHTML;

		// 模版字符串按行分隔
		var tplArrs = html.split('\n');

		for (var index = 0; index < tplArrs.length; ++index) {
			// 去掉前后多余的空格
			var item = this._handlePadding(tplArrs[index]);
			// 处理字符串
			this._handleStr(item);	
		}

		return template;
	},

	/**
	 * 执行解析后的js语句
	 * @param  {DOM对象}  root    挂载对象
	 * @param  {json}     data   解析的数据对象
	 */
	executeTpl: function(id, data) {
		// 获取添加的根节点
		var root = document.getElementById(id);
		
		this._replaceEval(this.jsStr);
		console.log(globalStr);
		root.innerHTML = globalStr;
	},


	/**
	 * 字符串的处理函数：将字符串处理为js语句
	 * @param  {string} str 需要处理的字符串
	 */
	_handleStr: function(str) {
		// 判断是否到达字符串尾部
		var isEnd = false;

		// 存放字符串分割的数组
		var strArr = [];

		// {{ 或者 }} 的位置
		var start = 0;
		var end = 0;
		
		// 是否将该字符串根据规则切分为对应的字符串数据
		while(!isEnd) {
			end = str.indexOf('{{', start);
			if(end != -1) {
				// 是否存在{{，如果存在，将{{之前的字符串push字符串数组，并将{{}}包含的字符串（包括{{}}）也push进入数组，继续处理
				strArr.push(str.slice(start, end));
				start = end;
				end = str.indexOf('}}', start);
				strArr.push(str.slice(start, end + 2));
				start = end + 2;
			} else {
				// 不存在{{}}，直接将为处理的字符串，直接push到数组中，终止循环
				strArr.push(str.slice(start, str.length));
				isEnd = true;
			}
		}
		// 处理处理过后的字符串数组
		this._handleArr(strArr);
	},

	/**
	 * 字符串数组处理函数：将传入的字符串数组，根据相应的规则进行处理
	 * @param  {array} arr 需要处理的字符串数组
	 */
	_handleArr: function (arr) {
		for (var i = 0; i < arr.length; ++i) {

			var str = arr[i];
			// {{在字符串中的位置
			var pos = str.indexOf('{{');

			if(pos == -1) {
				// 字符串中不存在{{,直接拼接
				if(str != '') {
					this.jsStr += "globalStr +='" + str + "';";
				}
			} else {
				// 如果字符串中存在，需要进行处理和判断
				// 去掉{{}}
				str = str.replace(/{{|}}/g, '');
				// 判断是不是if语句或者for语句
				if(str.indexOf('{') != -1 || str.indexOf('}') != -1){
					this.jsStr += str;
				} 
				// 判断是否是三目运算符
				else if(str.indexOf('?') != -1 || str.indexOf(':') != -1){
					// 处理三目运算符
					this._handleThreeOpt(str);
					this.jsStr += ";";
				}
				// 判断数据
				else {
					this.jsStr += "globalStr += " + str + ";";
				}

			}
		}
	},

	/**
	 * 三目远算符字符串处理函数：将传入的三目远算符字符串，根据相应的规则进行处理
	 * @param  {string} str 需要处理的三目远算符字符串
	 */
	_handleThreeOpt: function (str) {
		// 问号位置
		var qMarkPos = str.indexOf('?');
		this.jsStr += str.slice(0, qMarkPos + 1);

		// 判断是否有二级判断
		var otherQMarkerPos = str.indexOf('?', qMarkPos + 1);
		// 第一个冒号的位置
		var colonPos = str.indexOf(':', qMarkPos + 1);
		if(otherQMarkerPos == -1) {
			// 没有二级判断
			// 处理字符串
			this.jsStr += "globalStr+='" + this._handlePadding(str.slice(qMarkPos + 1, colonPos));
			this.jsStr += "':";
			this.jsStr += "globalStr+='" + this._handlePadding(str.slice(colonPos + 1, str.length));
			this.jsStr += "'";
		} else {
			// 判断二级判断在前在后
			if(otherQMarkerPos < colonPos) {
				// 在前
				var lastColonPos = str.lastIndexOf(':');
				this._handleThreeOpt(str.slice(qMarkPos + 1, lastColonPos));
				this.jsStr += ":";
				this.jsStr += "globalStr+='" + this._handlePadding(str.slice(lastColonPos + 1, str.length));
				this.jsStr += "'";
			} else {
				// 在后
				this.jsStr += "globalStr+='" + this._handlePadding(str.slice(qMarkPos + 1, colonPos));
				this.jsStr += "':";
				this._handleThreeOpt(str.slice(colonPos + 1, str.length));
			}
		}
	},

	/**
	 * 处理字符串前后空白
	 * @param  {string} str 需要处理的字符串
	 */
	_handlePadding: function(str) {
		return str.replace(/^\s*|\s*$/g, '');
	},

	/**
	 * 取代eval函数
	 * @param  {string} str 需要执行的字符串
	 */
	_replaceEval: function (str) {
		// 创建一个script标签，并指定id，便于执行后，删除该脚本标签
		var script = document.createElement('script');
		script.id = '$replaceEval';

		// 处理str，将其设置为一个自执行函数，并在执行最后删除添加到页面的标签
		str += ';var script = document.getElementById("$replaceEval"); document.body.removeChild(script);';

		// 将str作为script的文本内容
		script.innerHTML = str;

		// 添加到网页上，执行该脚本
		document.body.appendChild(script);

	}
}





















