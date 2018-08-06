/*
开发日期:2018.8.6
开发者:samt007
开发者联系邮件：samt007@qq.com
脚本用途:监听content_script发送的消息
*/

var timeInterval = 1.5 * 60; //poll interval(seconds)。后台轮询更新的时间

//var baseUrl = 'http://kqmai.com'
var queryUrl = 'http://miao.enjoyapps.org/queryMiaoList.php' //暂时接用原秒杀助手的信息。
//var miaoMoreLink = baseUrl + '/reviewMiaoData.php?ref=miao' // 更多秒杀链接
//var LINK_UPDATE = baseUrl + '/installation.html'
//var LINK_INSTALL = baseUrl + '/installation.html'
var queryData = new FormData();

var serverTimeUrl = 'http://api.m.taobao.com/rest/api3.do?api=mtop.common.getTimestamp';//获取更新信息API

var extID = chrome.i18n.getMessage("@@extension_id");
var extVersion
var platform = 'normal'

localStorage['platform'] = platform
//localStorage['ref_auto_buy'] = 'N'
!localStorage["timeGap"] && (localStorage["timeGap"]='0')

AjaxPost('manifest.json', 'form', function(rsp){
    extVersion = rsp.version
    localStorage['currentVersion'] = extVersion;
    queryData.append('version', extVersion);
}).send();

queryData.append('timestamp', localStorage['timestamp']);

if (!localStorage['baiduOcrKeys']) {
	var initBaiduOcrKeys=JSON.stringify(
	[{
		'apiKey': '92R3x6PaOyBuwp7YxwcYEmXj',
		'secretKey': '8xFGznGBXXm608DBLat9jWTNWeGyu1AF',
		'accessToken': '24.6aca226efa6237c692f7ad827b85c7c2.2592000.1532935439.282335-9976576'
	},{
		'apiKey': 'so4uSuzSstsbrxw8kXgCN5nc',
		'secretKey': 'zuxtZ7BZYHZZMZxpVprdR3wolKNEhKlS',
		'accessToken': '24.ba67b4ba828885b0d47c05edea97a799.2592000.1532695880.282335-11452461'
	}]
	);
	localStorage['baiduOcrKeys']=initBaiduOcrKeys;
	console.log('baiduOcrKeys:',localStorage['baiduOcrKeys'])
}

var i=0;
var gapTimeInterval=setInterval(function(){
	getGapTime(serverTimeUrl,function(timeGap,networkTime){
		i++;
		if(!isNaN(timeGap)&&networkTime<=40){
			localStorage['timeGap']=timeGap;
			console.log('update timeGap:'+localStorage['timeGap']);
			clearInterval(gapTimeInterval);
		}
		if(i>=50){
			console.log('获取次数超过 '+i+' 次都失败，同步退出！请检查你的网络情况。');
			clearInterval(gapTimeInterval);
		}
	})
}, 1000);

setInterval(function(){
	var i=0;
	gapTimeInterval=setInterval(function(){
		getGapTime(serverTimeUrl,function(timeGap,networkTime){
			i++;
			if(!isNaN(timeGap)&&networkTime<=40){
				localStorage['timeGap']=timeGap;
				console.log('update timeGap:'+localStorage['timeGap']);
				clearInterval(gapTimeInterval);
			}
			if(i>=50){
				console.log('获取次数超过 '+i+' 次都失败，同步退出！请检查你的网络情况。');
				clearInterval(gapTimeInterval);
			}
		})
	}, 1000);
}, 180000)

/**
 * 监听content_script发送的消息
 */
chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
	// 返回数据
	var dicReturn;
	
	// 读取已存数据
	if(request.action == 'get'){
		var codeBeginTime = +new Date;
		// 从Storage中读取对应key的数据
		var value={};
		for(var keyName in request.data.key){
			if(localStorage[keyName]){
				value[keyName]=localStorage[keyName];
			}
		}
		var tabStorage=JSON.parse(sessionStorage['tabStorage']||'{}');
		if(tabStorage[sender.tab.id]){
			for(var key in tabStorage[sender.tab.id]){
				//console.log(key+" value:"+tabStorage[sender.tab.id][key]);
				value[key]=tabStorage[sender.tab.id][key];
			}
		}
		dicReturn = {'status': 200, 'value': value};
		console.log('backg-TimeGap:'+value['timeGap']);
		console.log('code execute time:'+ (+new Date-parseInt(codeBeginTime)) );
		sendResponse(dicReturn);
	}

	// 保存
	if(request.action == 'set'||request.action == 'setJson'){// content_script传来message
		if(!sessionStorage['tabStorage']) sessionStorage['tabStorage']='{}';
		var tabStorage=JSON.parse(sessionStorage['tabStorage']);
		console.log('OLD:'+sessionStorage['tabStorage']);
		var setTabKeyFunc=function(tabStorage,key,value){
			var currTabJson=tabStorage[sender.tab.id]||{};
			//if(currTabJson===undefined) currTabJson={}
			currTabJson[key]=value;
			tabStorage[sender.tab.id]=currTabJson;
		}
		if(request.action == 'set'){
			setTabKeyFunc(tabStorage,request.data.key,request.data.value);
			sessionStorage['tabStorage']=JSON.stringify(tabStorage);
			dicReturn = {'status': 200, 'errbuf': value+' 已经成功保持!'};
		}else{
			for(var key in request.data){
				setTabKeyFunc(tabStorage,key,request.data[key]);
			}
			sessionStorage['tabStorage']=JSON.stringify(tabStorage);
			dicReturn = {'status': 200, 'errbuf': 'Json数据已经成功保持!'};
		}
		console.log('NEW:'+sessionStorage['tabStorage']);
		// 向content_script返回信息
		sendResponse(dicReturn);
	}
	
	if(request.action == 'ajax'){
		console.log(request.data);
		bgAjax({
			async: request.data.async,
			type: request.data.type,
			url: request.data.url,
			data: request.data.data,
			contentType: request.data.contentType,
			success: function(data){
				//console.log('bgAjax success',data);
				dicReturn = {'status': 200, 'data': data};
				sendResponse(dicReturn);
			},
			error: function(e){
				//console.log('bgAjax error',e);
				dicReturn = {'status': 500, 'data': e ? JSON.parse(e.responseText) : {}};
				sendResponse(dicReturn);
			}
		})
		return true;//必须要添加这个，否则异步有bug。https://blog.csdn.net/anjingshen/article/details/75579521
		//sendResponse(dicReturn);
		//AjaxPost(request.data.url, contentType, ajaxHandler)
	}
	
	if(request.action == 'setLocalStorage'){
		console.log(request.data);
		localStorage[request.data.key]=request.data.value;
		console.log('setLocalStorage:',request.data.key,localStorage[request.data.key]);
		dicReturn = {'status': 200, 'value': 'OK TO SET!'};
		sendResponse(dicReturn);
	}
	
});

// ajax factory 
function bgAjax(options){
	var defaults={
		async: true,
		type: 'POST',
		url: '',
		data: '',
		contentType: 'application/json; charset=utf-8',
		success: function(){},
		error: function(){}
	},
	opt = Object.assign({},defaults,options);
	//console.log('opt:',opt);
	//async, type, url, data, contentType, success, error
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){

        // complete
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                rsp = JSON.parse(xhr.responseText);
                opt.success&&opt.success(rsp);
            }else{
				opt.error&&opt.error(xhr);
			}
        }
    }
    xhr.open(opt.type, opt.url, opt.async);
	xhr.setRequestHeader("Content-type",opt.contentType);
    xhr.send(opt.data);
}

//后台自动执行的同步淘宝服务器的处理2018.5.21
function getGapTime(url, callback){
    var xhr = new XMLHttpRequest();
    var startDate, endDate, networkTime, serverTime, gagTime, rsp;
    xhr.open('GET', url, true);
	xhr.withCredentials = true;
    xhr.onreadystatechange = function(){
        // http://www.w3.org/TR/XMLHttpRequest/#states
        if(xhr.readyState === 4) {
            endDate = new Date();
			//console.log(xhr.responseText);
			rsp=JSON.parse(xhr.responseText);
            serverTime = parseInt(rsp.data.t);
			if(!serverTime) return;
            networkTime = Math.floor( (endDate.getTime() - startDate.getTime()) / 2 );
            gagTime = serverTime - (endDate.getTime() - networkTime);
			console.log('-->backg-TimeGap:'+gagTime+' ,networkTime:'+networkTime);
            callback && callback(gagTime,networkTime);
        }
    }
    startDate = new Date();
    xhr.send();
}

// ajax factory 
function AjaxPost(url, contentType, ajaxHandler){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){

        // complete
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                rsp = JSON.parse(xhr.responseText);
                ajaxHandler(rsp);
            }
        }
    }
    xhr.open("POST", url, true);
	
	if(contentType=='json'){
		xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
	}

    return xhr;
}

/*
chrome.windows.getCurrent(function(currWindow){
	console.log(currWindow)
})
console.log(chrome.windows.WINDOW_ID_CURRENT);
*/