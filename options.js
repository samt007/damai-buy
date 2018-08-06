
function setCheckBox($obj,value){
	if(value=='Y'){
		$obj.prop("checked",true);
	}else{
		$obj.prop("checked",false);
	}
}
function getCheckBox($obj){
	var value='N';
	if($obj.prop("checked")){
		value='Y';
	}else{
		value='N';
	}
	return value;
}

// Saves options to localStorage.
function save_options() {
	save_localStorage();
}

function save_localStorage() {
	localStorage.setItem("apiHost",$('#apiHost').val());
	localStorage.setItem("leadTimeOfBookTime",$('#leadTimeOfBookTime').val());
	localStorage.setItem("delayTimeOfBookTime",$('#delayTimeOfBookTime').val());
	localStorage.setItem("buyPageMaxRetryTimes",$('#buyPageMaxRetryTimes').val());
	localStorage.setItem("baiduOcrKeys",$('#baiduOcrKeys').val());
	localStorage.setItem("clickBuy",getCheckBox($('#clickBuy')));
	localStorage.setItem("clickOrder",getCheckBox($('#clickOrder')));
	localStorage.setItem("debugMode",getCheckBox($('#debugMode')));
}

function default_options() {
	localStorage.setItem("apiHost","http://erptest.xinyiglass.com:8000");
	localStorage.setItem("leadTimeOfBookTime","500");
	localStorage.setItem("delayTimeOfBookTime","0");
	localStorage.setItem("buyPageMaxRetryTimes","10");
	localStorage.setItem("baiduOcrKeys","");
	localStorage.setItem("clickBuy","Y");
	localStorage.setItem("clickOrder","Y");
	localStorage.setItem("debugMode","N");
}

// Restores select box state to saved value from localStorage.
function get_options() {
	//载入处理
	$('#apiHost').val(localStorage["apiHost"]||'http://erptest.xinyiglass.com:8000');
	$('#leadTimeOfBookTime').val(localStorage["leadTimeOfBookTime"]||'500');
	$('#delayTimeOfBookTime').val(localStorage["delayTimeOfBookTime"]||'0');
	$('#buyPageMaxRetryTimes').val(localStorage["buyPageMaxRetryTimes"]||'10');
	$('#baiduOcrKeys').val(localStorage["baiduOcrKeys"]||'');
	setCheckBox($('#clickBuy'),localStorage["clickBuy"]||'Y');
	setCheckBox($('#clickOrder'),localStorage["clickOrder"]||'Y');
	setCheckBox($('#debugMode'),localStorage["debugMode"]||'N');
}

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
            gagTime = serverTime - (endDate.getTime() - networkTime);//10毫秒代码执行时间！
			console.log('-->backg-TimeGap:'+gagTime+' ,networkTime:'+networkTime);
            callback && callback(gagTime,networkTime);
        }
    }
    startDate = new Date();
    xhr.send();
}

$(function(){
	$('#save').click(function(){
		console.log('save successfully!');
		save_options();
		layer.alert("保存成功！");
		return false;
	});
	$('#default').click(function(){
		layer.confirm('确定要恢复默认值？', {
		  btn: ['确认恢复','取消'] //按钮
		}, function(){
			default_options();
			get_options();
			layer.msg('成功恢复默认值！', {icon: 1});
		});
	});
	var quickBuyServerTimeUrl = 'http://api.m.taobao.com/rest/api3.do?api=mtop.common.getTimestamp';
	$('#getQuestionImg').click(function(){
		layer.confirm('目前存储的问题图片如下:<br/>'+localStorage["question_img"]+'<br/>确定要清空值？'
		, {
		  btn: ['确认清空','取消'] //按钮
		}, function(){
			localStorage.setItem("question_img","");
			layer.msg('成功清空！', {icon: 1});
		});
	});
	$('#syncTime').click(function(){
		//不断调用自动同步的逻辑，直至network时间是5秒内为止
		layer.confirm('目前的本地电脑和淘宝服务器的时间差(ms)：<b>'+localStorage["timeGap"]
		   +'</b><br/>确定要重新同步时间？'
		   +'<br/><span style="color:red;">注意：同步的时间可能稍长，主要是取决于您的网速情况！</span>'
		, {
		  btn: ['确认同步时间','取消'] //按钮
		}, function(index, layero){
			layer.close(index);
			//var index2=layer.alert("插件正在同步时间。。。请稍等。。。");
			var load = layer.load(2, {
			  shade: [0.5,'#fff'] //0.1透明度的白色背景
			});
			var timeInterval=setInterval(function(){
				getGapTime(quickBuyServerTimeUrl,function(timeGap,networkTime){
					if(!isNaN(timeGap)&&networkTime<=40){
						localStorage['timeGap']=timeGap;
						console.log('update timeGap:'+localStorage['timeGap']);
						clearInterval(timeInterval);
						layer.close(load);
						$('#timeGap').html(localStorage["timeGap"]);
						layer.msg('成功同步服务器时间！时间差：'+localStorage['timeGap'], {icon: 1});
					}
				})
			}, 1000);
		});
		
	})
	
	//localStorage["agree_flag"]="N";
	if(!localStorage["agree_flag"]||localStorage["agree_flag"]=='N'){
		//先显示协议
		layer.open({
		  type: 1, //page层
		  area: ['600px', '500px'],
		  title: '软件使用协议',
		  shade: 0.6, //遮罩透明度
		  moveType: 1, //拖拽风格，0是默认，1是传统拖动
		  shift: 1, //0-6的动画形式，-1不开启
		  skin: 'layui-layer-rim', //加上边框
		  closeBtn: 0,//不显示关闭按钮
		  content: '<div style="padding:20px;"><B>是否启用大麦下单功能？</B>'
					+'<br/>免责声明：'
					+'<br/>此程序是为了研究js而编写的，仅用于技术交流！'
					+'<br/>注意：<br/>自动购买下的订单信息可能会出错，所以，请在付款之前，要多注意！'
					+'<br/>不过，话说回来，买错了，取消订单就可以了，对您也不会有任何损失。<br/>'
					+'<br/>另外，该程序保证纯洁度，就是无广告，无窃取用户的私人信息或者密码等的后台代码。咱们都是良民，违法的事情不会做的。<br/>'
					+'<br/><B>如果有疑问请联系作者samt007!</B>'
					+'<br/>联系邮件:samt007@qq.com',
		  btn: ['<b>同意并启用自动购物功能</b>', '取消'],
		  success: function(){
					$('.layui-layer-rim').css('z-index','999999999');
				},
		  yes: function(index, layero){
					console.log('同意！');
					localStorage["agree_flag"]="Y";
					layer.msg('好了，可以借助这个小功能愉快地开启你的购物之旅了！', {icon: 1});
					get_options();
					layer.close(index);
				},btn2: function(index, layero){
					console.log('取消');
					$('#setting').html('警告：您没同意自动购物软件使用协议。该功能无效！<br/>如果想启用功能，请刷新该界面，然后同意软件协议即可。');
					$('#settingBtn').remove();
					layer.msg('您没同意自动购物软件使用协议。该功能无效！<br/>如果想启用功能，请刷新该界面，然后同意软件协议即可。', {icon: 2});
				}
		});
	}else{
		get_options();
	}
	console.log('load successfully!');
})