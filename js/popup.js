// var windows = chrome.windows.getCurrent(
//     function(windows){
//         try{
//             // dont really know why this is null. it should be a list of tabs.
//             if(windows.tabs == null) 
//         alert(windows.type + " " + windows.id);
//         }
//         catch(e){
//             alert(e);
//         }
//     });


/* 获取输入输入框中的主机和端口号 */
var ip,
    port;

var ipDOM = document.getElementById('localhost');
var portDOM = document.getElementById('port');

var debug = document.getElementById('debug');

ip = ipDOM.value;
port = portDOM.value;


function getInfo() {
    var jsonUrl = '';
    var tabUrl = '';

    ip = ipDOM.value;
    port = portDOM.value;
    // console.log(ip + ':' + port);
    jsonUrl = 'http://' + ip + ':' + port + '/json/list';

    getJSON(jsonUrl, {
        success: openTab,
        failure: failure
    });
}

function clean() {
    // 一次使用后失效
    ipDOM.disabled = true;
    portDOM.disabled = true;
    debug.classList.add('clicked');
    debug.removeEventListener('click', getInfo);
}

debug.addEventListener('click', getInfo);

function getJSON(url, options) {
    var data;
    var tabUrl;
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
                data = xhr.responseText;
                tabUrl = JSON.parse(data)[0]['devtoolsFrontendUrl'];
                console.log(tabUrl)
                options.success(tabUrl);
            } else {
                options.failure();
            }
        }
    }

    xhr.open('get', url, true);

    xhr.send(null);
}

function openTab(url) {
    chrome.tabs.create({
        url: url,
        active: true
    }, function(tab) {
        console.log(tab);
    });
}

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