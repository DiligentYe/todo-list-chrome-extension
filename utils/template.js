/*  解析前
		<ul>
			{{for(var i = 0; i < data.todos.length; ++i)}}
				{{if(data.todos[i].todo_type)}}
					<li>{{data.todos[i].todo_name}}</li>
				{{/if}}
			{{/for}}
		</ul>
 */

/*  解析后
 	var str = "";
	str += "<ul>";
	for (var i = 0; i < data.todos.length; ++i) {
		if (data.todos[i].todo_type) {
			str += "<li>";
			str += data.todos[i].todo_name;
			str += "</li>";
		}
	}
	str += "</ul>";
 */

/*  执行后
 	<ul><li>eat</li><li>sleep</li><li>play</li></ul>
 */

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
	complileTpl: function(tpl) {
		// 模版字符串按行分隔
		var tplArrs = tpl.split('\n');

		for (var index = 0; index < tplArrs.length; ++index) {

			var item = this._handlePadding(tplArrs[index]);

			// 处理不包含指令的行
			if (item.indexOf('{{') == -1) {
				this._handleLabel(item);
			} else {
				this._handleDirective(item);
			}
		}
	},

	/**
	 * 执行解析后的js语句
	 * @param  {DOM对象}  root    挂载对象
	 * @param  {json}     data   解析的数据对象
	 */
	executeTpl: function(root, data) {
		this._replaceEval(this.jsStr);
		console.log(globalStr);
		root.innerHTML = globalStr;
	},

	/**
	 * 不包含指令行的处理函数
	 * @param  {string} str 需要处理的字符串
	 */
	_handleLabel: function(str) {
		// 去除空行或者空白行
		if (str) {
			this.jsStr += "globalStr += '" + str + "';";
		}
	},

	/**
	 * 包含指令行的处理函数
	 * @param  {string} str 需要处理的字符串
	 */
	_handleDirective: function(str) {
		// 判断是否到达字符串尾部
		var isEnd = false;

		// 存放字符串分割的数组
		var strArr = [];

		// {{ 或者 }} 的位置
		var start = 0;
		var end = 0;
		// 处理指令前的字符串
		// var index = str.indexOf('{{');
		// var lastIndex = str.lastIndexOf('}}');
		// if (index == 0 && lastIndex == str.length - 2) {
		// 	this.jsStr += str.slice(index + 2, lastIndex);
		// } else if (index != 0 && lastIndex != str.length - 2) {
		// 	this.jsStr += "globalStr += '" + str.slice(0, index) + "';";
		// 	this.jsStr += "globalStr += " + str.slice(index + 2, lastIndex) + ";";
		// 	this.jsStr += "globalStr += '" + str.slice(lastIndex + 2, str.length) + "';";
		// } else {
		// 	throw new Error('格式错误');
		// }
		// while(!isEnd) {
		// 	end = str.indexOf('{{', start);
		// 	if(end != -1) {
		// 		strArr.push(str.slice(start, end));
		// 		start = end - 1;
		// 		end = str.indexOf('}}');
		// 		strArr.push(str.slice(start, end + 2));
		// 		start = end - 1;
		// 	} else {
		// 		strArr.push(str.slice(start, str.length));
		// 		isEnd = true;
		// 	}
		// }

	},

	/**
	 * 处理字符串前后空白
	 * @param  {string} str 需要处理的字符串
	 */
	_handlePadding: function(str) {
		return str.replace(/^\s*||\s*$/g, '');
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





















