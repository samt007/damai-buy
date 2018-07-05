
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
	getUserMessage();
	save_localStorage();
}


function getUserMessage(){
	//根据用户信息，找后台的权限配置：
	if(localStorage["username"]!=$('#username').val() || localStorage["user_password"]!=$('#user_password').val()){
		$.ajax({
			async:true,
			type:'post', 
			data:JSON.stringify({"username":$('#username').val(),"password":$('#user_password').val()}),
			contentType: 'application/json; charset=utf-8',
			url:localStorage['quickBuyApiUrl']+'/quick-buy/fnd/quickbuy/getUserData',
			dataType:'json',
			success: function (data) {
				//console.log(data)
				localStorage["orderBuyRight"]='N';
				localStorage["payBuyRight"]='N';
				localStorage["miaoBuyRight"]='N';
				localStorage["activeEndDate"]='';
				if(data.ok){
					localStorage["activeEndDate"]=data.data.user.activeEndDate;
					data.data.userRight.forEach(function( val, index ) {
						//console.log( val);
						if(val.rightCode=='orderBuyRight') localStorage["orderBuyRight"]='Y';
						if(val.rightCode=='payBuyRight') localStorage["payBuyRight"]='Y';
						if(val.rightCode=='miaoBuyRight') localStorage["miaoBuyRight"]='Y';
					});
					showUserMessage();
				}else{
					$('#userMessage').html('<br/>用户验证失败！信息：'+data.message);
				}
			},
			error: function () {
				console.log("获取Json数据失败");					
			}
		});
	}else{
		showUserMessage();
	}
}

function showUserMessage(){
	var htmlStr='';
	if(localStorage["activeEndDate"]){
		htmlStr='用户有效期：'+localStorage["activeEndDate"]
	}else{
		htmlStr='用户验证失败！请修改用户信息再保存！'
	}
	$('#userMessage').html('<br/>'+htmlStr
	+'<br/>卡时下单权限：'+localStorage["orderBuyRight"]
	+'<br/>卡时付款权限：'+localStorage["payBuyRight"]
	+'<br/>秒杀助手权限：'+localStorage["miaoBuyRight"]);
}

function save_localStorage() {
	localStorage.setItem("click_buy_delay",$('#click_buy_delay').val());
	localStorage.setItem("ref_auto_buy",getCheckBox($('#ref_auto_buy')));
	localStorage.setItem("ref_background",getCheckBox($('#ref_background')));
	localStorage.setItem("bell_alert",getCheckBox($('#bell_alert')));
	localStorage.setItem("msg_alert",getCheckBox($('#msg_alert')));
	localStorage.setItem("ref_bf_buy",getCheckBox($('#ref_bf_buy')));
	localStorage.setItem("click_buy",getCheckBox($('#click_buy')));
	localStorage.setItem("click_order",getCheckBox($('#click_order')));
	localStorage.setItem("debug_mode",getCheckBox($('#debug_mode')));
	localStorage.setItem("miao_deal_sec",$('#miao_deal_sec').val());
	localStorage.setItem("miao_kill_time",$('#miao_kill_time').val());
	localStorage.setItem("server_time_gap",$('#server_time_gap').val());
	localStorage.setItem("leadTimeOfBookTime",$('#leadTimeOfBookTime').val());
	localStorage.setItem("miao_lead_ref_sec",$('#miao_lead_ref_sec').val());
	localStorage.setItem("miao_frequency",$('#miao_frequency').val());
	localStorage.setItem("miao_test_id",$('#miao_test_id').val());
	localStorage.setItem("miao_img_style",$('#miao_img_style').val());
	localStorage.setItem("license_code",$('#license_code').val());
	localStorage.setItem("click_pay",getCheckBox($('#click_pay')));
	localStorage.setItem("pay_password",$('#pay_password').val());
	localStorage.setItem("username",$('#username').val());
	localStorage.setItem("user_password",$('#user_password').val());
}

function default_options() {
	localStorage.setItem("click_buy_delay","600");
	localStorage.setItem("ref_auto_buy","N");
	localStorage.setItem("ref_background","N");
	localStorage.setItem("bell_alert","Y");
	localStorage.setItem("msg_alert","Y");
	localStorage.setItem("ref_bf_buy","N");
	localStorage.setItem("click_buy","Y");
	localStorage.setItem("click_order","Y");
	localStorage.setItem("debug_mode","N");
	localStorage.setItem("miao_deal_sec","60");
	localStorage.setItem("miao_kill_time","1000");
	localStorage.setItem("server_time_gap","0");
	localStorage.setItem("leadTimeOfBookTime","500");
	localStorage.setItem("miao_lead_ref_sec","5");
	localStorage.setItem("miao_frequency","10");
	localStorage.setItem("miao_test_id","");
	localStorage.setItem("miao_img_style","width:900px;height:220px");
	localStorage.setItem("license_code","");
	localStorage.setItem("click_pay","N");
	localStorage.setItem("pay_password","");
	sessionStorage.setItem('quickBuyFlag','N');
	localStorage.setItem('username','kqmai.com');
	localStorage.setItem('user_password','kqmai123');
	getUserMessage();
}

// Restores select box state to saved value from localStorage.
function get_options() {
	//载入处理
	$('#click_buy_delay').val(localStorage["click_buy_delay"]||'600');
	setCheckBox($('#ref_auto_buy'),localStorage["ref_auto_buy"]||'N');
	setCheckBox($('#ref_background'),localStorage["ref_background"]||'N');
	setCheckBox($('#bell_alert'),localStorage["bell_alert"]||'Y');
	setCheckBox($('#msg_alert'),localStorage["msg_alert"]||'Y');
	setCheckBox($('#ref_bf_buy'),localStorage["ref_bf_buy"]||'N');
	setCheckBox($('#click_buy'),localStorage["click_buy"]||'Y');
	setCheckBox($('#click_order'),localStorage["click_order"]||'Y');
	setCheckBox($('#debug_mode'),localStorage["debug_mode"]||'N');
	$('#miao_deal_sec').val(localStorage["miao_deal_sec"]||'60');
	$('#miao_kill_time').val(localStorage["miao_kill_time"]||'1000');
	$('#server_time_gap').val(localStorage["server_time_gap"]||'0');
	$('#leadTimeOfBookTime').val(localStorage["leadTimeOfBookTime"]||'500');
	$('#miao_lead_ref_sec').val(localStorage["miao_lead_ref_sec"]||'5');
	$('#miao_frequency').val(localStorage["miao_frequency"]||'10');
	$('#miao_test_id').val(localStorage["miao_test_id"]||'');
	$('#miao_img_style').val(localStorage["miao_img_style"]||'width:900px;height:220px');
	$('#license_code').val(localStorage["license_code"]||'');
	setCheckBox($('#click_pay'),localStorage["click_pay"]||'N');
	$('#pay_password').val(localStorage["pay_password"]||'');
	$('#username').val(localStorage["username"]);
	$('#user_password').val(localStorage["user_password"]);
	$('#timeGap').html(localStorage["timeGap"]);
	getUserMessage();
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
		  content: '<div style="padding:20px;"><B>是否启用一键购买功能？</B>'
					+'<br/>免责声明：'
					+'<br/>此程序是为了研究js而编写的，仅用于技术交流，不可以作为商业用途！'
					+'<br/>注意：<br/>自动购买下的订单信息可能会出错，所以，请在付款之前，要多注意！'
					+'<br/>不过，话说回来，买错了，取消订单就可以了，对您也不会有任何损失。<br/>'
					+'<br/>另外，该程序保证纯洁度，就是无广告，无窃取用户的私人信息或者密码等的后台代码。咱们都是良民，违法的事情不会做的。<br/>'
					+'<br/>(2017.12.9更新)添加辅助秒杀功能。打开http://miaosha.taobao.com/进入秒杀区就可用。为了公平起见，每个淘宝用户只可以有30天的试用期。<br/>'
					+'<br/><B>如果有疑问请联系作者samt007!</B>'
					+'<br/>联系邮件:samt007@qq.com'
					+'<br/>或者访问一键购物助手的官方主页（快去买）：<a href="http://kqmai.com" target="_blank">http://kqmai.com</a></div>',
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
					$('#miaoSetting').remove();
					$('#settingBtn').remove();
					layer.msg('您没同意自动购物软件使用协议。该功能无效！<br/>如果想启用功能，请刷新该界面，然后同意软件协议即可。', {icon: 2});
				}
		});
	}else{
		get_options();
	}
	console.log('load successfully!');
})