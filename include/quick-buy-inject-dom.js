/*
开发日期:2016.5.11
开发者:samt007
开发者联系邮件：samt007@qq.com
特别说明:一键购物助手。详细的说明手册请看：快去买 http://kqmai.com
*/

function buyPageBookTime(sour,options,yesCallback){//购买页面的设置预约时间以及一些参数的
layer.open({
	type: 1, //page层
	area: ['520px','420px'],
	title: '<B>一键购物助手--购买设定（主页地址：<a href="http://kqmai.com" target="_blank">快去买</a>）</B>',
	shade: 0.6, //遮罩透明度
	moveType: 1, //拖拽风格，0是默认，1是传统拖动
	shift: 0, //0-6的动画形式，-1不开启
	skin: 'layui-layer-rim', //加上边框
	zIndex:999999901,
	content:'<div style="padding:20px;font-size:12px;">'
		+' <form class="boostrapTable form-horizontal" style="margin-top:20px;margin-right:20px" role="form">'
		+' <div class="form-group">'
		+' <label for="bookTimeBuy" class="col-sm-3 control-label">预约购买时间</label>'
		+' <div class="col-sm-9">'
		+'   <div class="input-group">'
		+'   <input type="text" class="form-control" id="bookTimeBuy" placeholder="预约购买时间">'
		+' 	<span class="input-group-btn">'
		+' 	<button class="btn btn-default" type="button" id="open"><span class="glyphicon glyphicon-calendar"></span></button>'
		+' 	</span>'
		+'  </div>'
		+'  <span class="help-block" id="miao-help">'
		+'    <b>系统当前时间: </b><span id="sysDT"></span>'
		+'    <br/>购买时间点的逻辑是：如果预约购买时间<=系统当前时间，则执行立刻购买。否则将倒计时预约购买。'
		+'    <span><br/><label for="orderBuyFlag">预约时间为实际下单时间：</label><input type="checkbox" id="orderBuyFlag"></span>'
		+'    <span id="payBuyFlag-key"><br/><label for="payBuyFlag">预约时间为实际付款时间：</label><input type="checkbox" id="payBuyFlag"></span>'
		//+'    <span><br/><label for="refBfBuy">购买前自动刷新（本次）：</label><input type="checkbox" id="refBfBuy"></span>'
		+'  </span>'
		+' </div>'
		+' </div>'
		+' <div class="form-group">'
		+' <label for="buyProp" class="col-sm-3 control-label">预定义购买属性</label>'
		+' <div class="col-sm-9">'
		+'   <input type="text" class="form-control" id="buyProp" placeholder="请输入预定义的购买属性">'
		+'   <span class="help-block">购买数量是1，不用填写，数量2请填写&2，以此类推。商品属性请直接在页面选择，插件会自动保存。</span>'//另外，数量请用&分割。例如:L码&2
		+' </div>'
		+' </div>'
		+' </form>'
		+'</div>',
	btn: ['<span style="font-weight:600">确认一键购买</span>', '取消'],
	success: function(layero, index){
			$(layero).css('z-index','999999990');//设定这个是为了解决layer界面和淘宝本身的ui的显示层次问题！
			if(sour=='taobaoBuyPage') $('#detail').css('z-index','9999999');//为了提高用户体验写的。
			$('.layui-layer-btn').css('font-size','17px');
			$('#bookTimeBuy').val(getServerDateFormat2());//默认值
			$('#payBuyFlag').prop("checked",false);
			if(options.ref_bf_buy=='Y'){
				$('#refBfBuy').prop("checked",true);
			}else{
				$('#refBfBuy').prop("checked",false);
			}
			if(options.click_pay!='Y'||!options.pay_password||sour=='juPage'||options.payBuyRight=='N'){
				$('#payBuyFlag').attr("disabled",true);
			}
			//debug('options.click_buy:'+options.click_buy);
			if(options.click_buy!='Y'||sour!='tmallBuyPage'||options.orderBuyRight=='N'){
				$('#orderBuyFlag').attr("disabled",true);
			}else{
				$('#orderBuyFlag').prop("checked",true);//先默认选上
			}
			/*if(!options.miao_test_id){
				$('#payBuyFlag-key').remove();
			}*/
			if(sour=='cartPage'){
				$('#buyProp').attr("disabled",true);
			}
			$("#bookTimeBuy").focus();
			$('#bookTimeBuy').datetimepicker({
				  lang:"zh",           //语言选择中文
				  timepicker:true,    //启用时间选项
				  format:"Y-m-d H:i:s",      //格式化日期
				  step: 10,
				  showOnClick: false,
				  //onSelectTime: function () {}onChangeDateTime
				  onSelectTime: function () {//写当选择时间的回调函数，目的是为了自动去掉秒
					  var selectDT=$('#bookTimeBuy').val();
					  var newDt='';
					  var dtArray=selectDT.split(':');
					  for(var idx in dtArray){
						  if(idx<=1) newDt+=dtArray[idx]+':';
					  }
					  $('#bookTimeBuy').val(newDt+'00');
				  }
			});
			$('#open').click(function(){
				$('#bookTimeBuy').datetimepicker('show');
			});
			$('#open,#bookTimeBuy').keydown(function(event){
				if(event.keyCode==13||event.which==13){
					document.getElementsByClassName('layui-layer-btn0')[0].click();
					return false;
				}
			});
			showSysDT($('#sysDT')[0]);//显示系统日期给用户，方便查看系统时间
			if(sour=='juPage'&&$('button.J_JuSMSRemind')[0]&&$('div.J_juItemTimer').find('p')[0]){
				var monthDay=($('div.J_juItemTimer').find('p').html()).split('日')[0];
				var hourTime=($('div.J_juItemTimer').find('p').html()).split('日')[1];
				hourTime=hourTime.replace('开抢','').trim();
				$('#bookTimeBuy').val(new Date().Format('yyyy')+'-'+monthDay.replace('月','-').replace('日','')+' '+hourTime+':00');
			}
		},
	yes: function(index, layero){//同意之后的处理
			var buyProp,bookTimeBuy;
			buyProp = $('#buyProp').val();//prompt('请输入购买属性(不输入则默认自动购买)','')||'';
			//buyRemark = '';//prompt('请输入给卖家的留言','');//设定给买家的留言是什么//storageMain.setItem('buyRemark',buyRemark);
			bookTimeBuy= $('#bookTimeBuy').val();
			if(!bookTimeBuy||isNaN(new Date(bookTimeBuy).getTime())){
				alert('请输入正确的日期！注意格式是：yyyy-MM-dd hh:mm:ss');
				return false;
			}
			if($('#orderBuyFlag').prop("checked") && $('#payBuyFlag').prop("checked")){
				alert('卡时下单和卡时付款不可以同时选中！系统处理会有冲突！');
				return false;
			}
			sessionStorage.setItem('buyProp',buyProp);
			//sessionStorage.setItem('buyRemark',buyRemark);
			//sessionStorage.setItem('bookTimeBuy',bookTimeBuy);
			if(sour=='taobaoBuyPage'){
				$('#detail').css('z-index','99999999');
			}
			if($('#payBuyFlag').prop("checked")){
				sessionStorage.setItem('payBuyFlag','Y');//主要是为下一个处理用
			}else{
				sessionStorage.setItem('payBuyFlag','N');
			}
			if($('#orderBuyFlag').prop("checked")){
				sessionStorage.setItem('orderBuyFlag','Y');//主要是为下一个处理用
			}else{
				sessionStorage.setItem('orderBuyFlag','N');
			}
			if($('#refBfBuy').prop("checked")){
				sessionStorage.setItem('refBfBuy','Y');
			}else{
				sessionStorage.setItem('refBfBuy','N');
			}
			clearSysDT();
			debug('-->预约购买时间:'+bookTimeBuy);
			yesCallback&&yesCallback(buyProp,bookTimeBuy);
			//buyPageDeal(buyProp,bookTimeBuy,sour,buyBtnObj,options);//调用购买页面的处理封装
			layer.close(index);
		},
	btn2: function(index, layero){
			clearSysDT();
			if(sour=='taobaoBuyPage') $('#detail').css('z-index','99999999');
		}
});
}

function miaoPageBookTime(sour,options,yesCallback){
	/*var checkMiao=checkTaobaoUserLicense(options.taobao_user,options.license_code)
	if(checkMiao.code!=='0'){
		showMsg('您不可以使用秒杀助手，原因：'+checkMiao.message);
		return false;
	}*/
	if(options.miaoBuyRight=='N'){
		showMsg('您的用户没权限使用秒杀助手，有疑问请联系作者：samt007@qq.com。');
		return false;
	}
	var defTimes=0;//避免有时候网络延迟，导致获取不到正确的日期，所以先得确定界面正确显示秒杀的时间！
	var DefTimeTask=setInterval(function(){
		if($('#J_SecKill').html()){
			clearInterval(DefTimeTask);
			if(($('.no-stock').html())&&($('.no-stock').html()).indexOf('秒杀已结束')!=-1){
				showMsg('注意：秒杀已经结束！<br/>感谢您使用一键购物助手！');
				return false;
			}
			if(($('.sec-killp-note p').html())&&($('.sec-killp-note p').html()).indexOf('此宝贝仅限通过')!=-1){
				showMsg('注意：该宝贝仅限在手机端秒杀！<br/>感谢您使用一键购物助手！');
				return false;
			}
			if(!$('.need-login')[0]){
				layer.open({//开始处理秒杀
					type: 1, //page层
					area: ['510px','340px'],
					title: '<B>一键购物助手--秒杀时间设定</B>',
					shade: 0.6, //遮罩透明度
					moveType: 1, //拖拽风格，0是默认，1是传统拖动
					shift: 0, //0-6的动画形式，-1不开启
					skin: 'layui-layer-rim', //加上边框
					zIndex:999999991,
					content:'<div style="padding:20px;font-size:12px;">'
						+' <form class="boostrapTable form-horizontal" style="margin-top:20px;margin-right:20px" role="form">'
						+' <div class="form-group">'
						+' <label for="bookTimeBuy" class="col-sm-3 control-label">秒杀购买时间</label>'
						+' <div class="col-sm-9">'
						+'   <div class="input-group">'
						+'   <input type="text" class="form-control" id="bookTimeBuy" placeholder="秒杀购买时间"/>'
						+' 	<span class="input-group-btn">'
						+' 	<button class="btn btn-default" type="button" id="open"><span class="glyphicon glyphicon-calendar"></span></button>'
						+' 	</span>'
						+'  </div>'
						+'  <span class="help-block">'
						+'    <b>系统当前时间: </b><span id="sysDT"></span><br/>秒杀的处理是：'
						+'    <br/>请确认准确的秒杀购买时间，系统在秒杀前会自动进入秒杀状态。到时候请进入界面按照提示进行秒杀购物的操作！'
						+'    <br/><div style="margin-top:3px"><label for="alert_flag">秒杀前自动通知：</label><input type="checkbox" id="alert_flag">'
						+'    <br/><label for="miao_order_flag">秒杀后自动提交：</label><input type="checkbox" id="miao_order_flag"></div>'
						+'  </span>'
						+' </div>'
						+' </div>'
						+' </form>'
						+'</div>',
					btn: ['<span style="font-weight:600">确认预约秒杀购买</span>', '取消'],
					success: function(layero, index){
							$(layero).css('z-index','999999999');//设定这个是为了解决layer界面和淘宝本身的ui的显示层次问题！
							$('#alert_flag').prop("checked",false);
							$('#miao_order_flag').prop("checked",true);
							$('.layui-layer-btn').css('font-size','17px');
							if($('#J_SecKill .date').html()){
								$('#bookTimeBuy').val($('#J_SecKill .date').html()
								.replace('年','-').replace('月','-').replace('日','')+' '+$('#J_SecKill .time').html());
							}else if($('.nyr-time').html()){
								$('#bookTimeBuy').val($.trim($('.nyr-time').html())
								.replace('年','-').replace('月','-').replace('日','')+' '+$.trim($('.fmks-time').html()).replace('开售',''));
							}else{
								$('#bookTimeBuy').val(getServerDateFormat2());
							}
							$("#bookTimeBuy").focus();
							$('#bookTimeBuy').datetimepicker({
								  lang:"zh",           //语言选择中文
								  timepicker:true,    //启用时间选项
								  format:"Y-m-d H:i:s",      //格式化日期
								  step: 10,
								  showOnClick: false,
								  onSelectTime: function () {//写当选择时间的回调函数，目的是为了自动去掉秒
									  var selectDT=$('#bookTimeBuy').val();
									  var newDt='';
									  var dtArray=selectDT.split(':');
									  for(var idx in dtArray){
										  if(idx<=1) newDt+=dtArray[idx]+':';
									  }
									  $('#bookTimeBuy').val(newDt+'00');
								  }
							});
							$('#open').click(function(){
								$('#bookTimeBuy').datetimepicker('show');
							});
							$('#open,#bookTimeBuy').keydown(function(event){
								if(event.keyCode==13||event.which==13){
									document.getElementsByClassName('layui-layer-btn0')[0].click();
									return false;
								}
							});
							showSysDT($('#sysDT')[0]);
							//自动点击按钮 $('.layui-layer-btn0').click();
						},
					yes: function(index, layero){//同意之后的处理
							var bookTimeBuy= $('#bookTimeBuy').val();
							if(isNaN(new Date(bookTimeBuy).getTime())){
								showMsg('请输入正确的日期！注意格式是：yyyy-MM-dd hh:mm:ss');
								return false;
							}
							if($('#alert_flag').prop("checked")){
								sessionStorage.setItem('miaoAlert','Y');
							}else{
								sessionStorage.setItem('miaoAlert','N');
							}
							if($('#miao_order_flag').prop("checked")){
								sessionStorage.setItem('miaoOrderFlag','Y');
							}else{
								sessionStorage.setItem('miaoOrderFlag','N');
							}
							//sessionStorage.setItem('bookTimeBuy',bookTimeBuy);
							clearSysDT();
							yesCallback && yesCallback(bookTimeBuy);
							//miaoPageDeal(bookTimeBuy,sour,options);//调用秒杀页面的处理封装
							layer.close(index);
						},
					btn2: function(index, layero){
							clearSysDT();
						}
				});
			}else{
				showMsg('注意：请先登录淘宝用户再执行秒杀！<br/>如果已经登录，请直接刷新页面或者点击一键购物的图标。');
				var notiBody="你好！请先登录淘宝用户再执行秒杀！\n感谢您使用淘宝自动购买助手。";//添加桌面通知！
				var notification = new Notification('淘宝自动购买助手通知',{body:notiBody});
				return false;
			}
		}else{
			defTimes++;
			if(defTimes>20){
				clearInterval(DefTimeTask);
				showMsg('初始化秒杀界面失败！尝试次数超过20次！');
			}
		}
	},600);
}

function loginPageRef(){
	var timeOutMins=parseInt(5+randomNumber(1,5));
	debug('后台等待自动刷新时间(分钟):'+timeOutMins);
	var timeID = setTimeout(function(){
		debug('-->后台开始自动刷新！刷新时间:'+getServerDateFormat());
		location.reload();
	},timeOutMins*60*1000);
	layer.open({
	  content: '<b>Tips:为防止淘宝在自动购买的时候需要重新登录帐号<br/>插件会在 (<span id="timeOutMins">'+timeOutMins+'</span>) 分钟之后自动刷新网页！</b>'
			 +'<br/>如果不需要自动刷新，请点确定按钮或者直接关闭网页即可。',
	  skin: 'layui-layer-dialog',
	  area: ['420px','240px'],
	  zIndex:999999991,
	  icon: 6,
	  success: function(){
		var taskId=setInterval(function(){
			var leftMins=parseInt($('#timeOutMins').html());
			$('#timeOutMins').html(leftMins-1);
			if((leftMins-1)<0){
				clearInterval(taskId);
			}
		},60*1000);
	  },
	  btn: ['取消自动刷新定时器'],
	  yes: function(index, layero){
		clearTimeout(timeID);
		sessionStorage['loginPageRef']='N';
		showMsg('自动刷新定时器已经取消！');
	  }
	});
}

function buyPageShowRemain(sour,buyProp,timeOut,bookTimeBuy,options){
	var buyPropDesc,nextSecGap;
	buyPropDesc = buyProp||'(未定义)';
	nextSecGap=timeOut%1000;
	debug('nextSecGap(与下一秒相隔的毫秒):'+nextSecGap+',timeOut:'+timeOut);
	layer.open({
	  type: 1, //page层
	  area: ['540px', '240px'],
	  title: '<B>一键购物助手--自动购买倒计时（主页地址：<a href="http://kqmai.com" target="_blank">快去买</a>）</B>',
	  shade: 0.5, //遮罩透明度
	  moveType: 1, //拖拽风格，0是默认，1是传统拖动
	  shift: 2, //0-6的动画形式，-1不开启
	  skin: 'layui-layer-rim',
	  offset: 'rb',
	  zIndex:999999991,
	  //scrollbar: false,
	  closeBtn: 1,
	  content: '<div style="background:#333333;padding:20px;font-size:12px;">'
			+'<div id="times_container"  style="border:1px; border-color:#999999; background:#333333; color:#FFFFFF; width:500px; height:40px; line-height:40px; font-size:26px">'
			+'离自动购买还有：<span id="times_day"></span>天<span id="times_hour"></span>时<span id="times_minute"></span>分<span id="times_second"></span>秒'
			+'</div>'
			+'</div>'
			+'<div>'
			+'<div style="padding:8px;"><span class="help-block" style="margin-bottom:5px;">'
			+'<B>预约购买时间：  </B>'+bookTimeBuy
			+'<br/><B>预定购买属性：</B>'+buyPropDesc
			+'<br/><B>购物助手设定：</B><b>自动下单:</b>'+options.click_order+'&nbsp;/&nbsp;<b style="color:red;">自动付款:</b>'+options.click_pay
			+'<span id="setByTime"><br/></span>'
			+'<br/>提示：如果要取消预约购物，请关闭此小窗口，或者直接关闭页签。'
			+'</span>'
			+'</div>'
			+'</div>',
	  success: function(layero, index){//启动成功的时候，自动调用的回调函数！
				$(layero).css('z-index','999999999');//$(layero).css('background-color','#eee');
				$('.layui-layer-ico').css('background','url("'+chrome.extension.getURL("include/layer/skin/default/icon.png")+'") no-repeat');
				$('.layui-layer-ico').css('background-position','0 -40px');
				if(sour=='taobaoBuyPage') $('#detail').css('z-index','999999');
				var time_distance=timeOut;//显示倒计时效果
				refTime(time_distance);
				setTimeout(
					function(){
						time_distance=time_distance-(1000+nextSecGap);
						var taskId=setInterval(
							function(){
								refTime(time_distance);
								time_distance=time_distance-1000;
								if(time_distance<0){clearInterval(taskId);}
							},1000);
					},nextSecGap);
				if(sour=='taobaoBuyPage') $('#detail').css('z-index','99999999');
				setTimeout(function(){layer.close(index);},timeOut);
				if(sessionStorage.getItem('orderBuyFlag')=='Y'){
					var mBuylink=getTmailMobileBuylink(window.location.href,buyProp);
					mBuylink += '&testFlag=Y&quickBuyFlag=Y&timeGap='+options.timeGap;
					$('#setByTime').html('<br/><B>预约时间=实际下单时间：</B>'+sessionStorage.getItem('orderBuyFlag')
					+'&nbsp-->&nbsp<a id="testBuyLink" target="_blank" href="#">下订单界面预览</a>');
					$('#testBuyLink').click(function(e){
						mBuylink += '&serverTime='+getServerTime();
						$(e.target).attr('href',mBuylink);
					});
				}else if(sessionStorage.getItem('payBuyFlag')=='Y'){
					$('#setByTime').html('<br/><B>预约时间=实际付款时间：</B>'+sessionStorage.getItem('payBuyFlag'));
				}
			},
		cancel: function(index){
				if(sour=='taobaoBuyPage') $('#detail').css('z-index','99999999');
				layer.close(index);
				showAlert('提示：本次自动购物已经停掉!\n请点确定按钮，自动刷新该界面！'
				,function(){
					location.reload();//关闭后的操作
				});
			}
	});
}

function payPageShowRemain(timeOut){
	layer.open({
	  type: 1,
	  title: false,
	  closeBtn: 0,
	  shadeClose: false,
	  skin: 'layui-layer-rim',
	  zIndex:999999991,
	  shift: 1,
	  content: '<b>请耐心等候 '+timeOut/1000+' 秒。。。系统正在付款中。。。</b>'
			  +'<br/>提示：如果要取消系统自动付款，请直接刷新界面，或者直接关掉页签！',
	  success: function(layero, index){
		  $(layero).css({'background-color':'#81BA25','color':'#fff'});
		  $(layero).find('div.layui-layer-content').css('padding','30px');
	  }
	});
}

function orderPageShowRemain(timeOut){
	layer.open({
	  type: 1,
	  title: false,
	  closeBtn: 0,
	  shadeClose: false,
	  skin: 'layui-layer-rim',
	  zIndex:999999991,
	  shift: 1,
	  content: '<b>请耐心等候 '+timeOut/1000+' 秒。。。系统正在下单中。。。</b>'
			  +'<br/>提示：如果要取消系统自动下单，请直接刷新界面，或者直接关掉页签！',
	  success: function(layero, index){
		  $(layero).css({'background-color':'#81BA25','color':'#fff'});
		  $(layero).find('div.layui-layer-content').css('padding','30px');
	  }
	});
}

function buyPageShowLoading(timeOut){
	layer.open({
	  type: 1,
	  title: false,
	  closeBtn: 0,
	  shadeClose: false,
	  skin: 'layui-layer-rim',
	  zIndex:999999991,
	  shift: 1,
	  content: '<b>请耐心等候 '+Math.round(parseFloat(timeOut/1000)*100)/100+' 秒。。。<br/>插件正在界面寻找消失的购买按钮。。。</b>'
			  +'<br/>提示：如果要取消系统自动购买，请直接刷新界面！',
	  success: function(layero, index){
		  $(layero).css({'background-color':'#81BA25','color':'#fff'});
		  $(layero).find('div.layui-layer-content').css('padding','30px');
	  }
	});
}

function orderPageShowTest(testStartServerTime,getBtnServerTime,params){
	layer.open({
	  type: 1,
	  title: '下单页面时间测试',
	  closeBtn: 1,
	  shadeClose: false,
	  skin: 'layui-layer-rim',
	  zIndex:999999991,
	  shift: 1,
	  content: '<b>下单页面的测试加载时间如下：</b>'
	          +'<br/>从提交请求到加载Dom耗时(毫秒)：'+((testStartServerTime-parseInt(params.serverTime))+100)
	          +'<br/>浏览器渲染Js代码耗时(毫秒)：'+(getBtnServerTime-testStartServerTime)
			  +'<br/>您可以根据测试的结果配置下单提前期！',
	  success: function(layero, index){
		  $(layero).css({'background-color':'rgba(144, 132, 100, 0.66)','color':'#fff'});
		  $(layero).find('div.layui-layer-content').css('padding','20px');
		  $('.layui-layer-ico').css('background','url("'+chrome.extension.getURL("include/layer/skin/default/icon.png")+'") no-repeat');
		  $('.layui-layer-ico').css('background-position','0 -40px');
	  },
	  cancel: function(index){
		  layer.close(index);
	  }
	});
}

function miaoPageShowRemain(timeOut,bookTimeBuy,miaoDealTime){
var nextSecGap=timeOut%1000;
debug('nextSecGap(与下一秒相隔的毫秒):'+nextSecGap+',timeOut:'+timeOut);
layer.open({
  type: 1, //page层
  area: ['460px', '310px'],
  title: '<B>一键购物助手--秒杀购买倒计时</B>',
  shade: 0.5, //遮罩透明度
  moveType: 1, //拖拽风格，0是默认，1是传统拖动
  shift: 2, //0-6的动画形式，-1不开启
  skin: 'layui-layer-rim',
  offset: 'rb',
  zIndex:999999991,
  //scrollbar: false,
  closeBtn: 1,
  content: '<div style="background:#333333;padding:20px;font-size:12px;">'
		+'<div id="times_container"  style="border:1px; border-color:#999999; background:#333333; color:#FFFFFF; width:420px; height:40px; line-height:40px; font-size:26px">'
		+'离秒杀购买还有：<span id="times_day"></span>天<span id="times_hour"></span>时<span id="times_minute"></span>分<span id="times_second"></span>秒'
		+'</div>'
		+'</div>'
		+'<div>'
		+'<div style="padding:10px;"><span class="help-block">'
		+'<B>秒杀购买时间：  </B>'+bookTimeBuy+'<br/>'
		+'<B>注意：</B><br/>系统在秒杀前 '+miaoDealTime/1000+' 秒会自动刷新，并且会进入淘宝的秒杀流程：'
		+'<br/>-->①系统根据设定自动点击<秒杀抢宝>(刷新)按钮，直到可以秒杀。'
		+'<br/>-->②系统再自动放大验证图片，并且可以方便您直接输入验证问题。'
		+'<br/>-->③待您输入验证码的答案之后，按回车，即可秒杀购物！'
		+'<br/><b>一句话概括该功能的作用：让您专注输入验证问题,别的事情系统都会自动做!</b>'
		+'<br/>提示：如果要取消秒杀购物，只需要关闭此小窗口或者直接刷新页面即可。'
		//+'<br/>②为了加快秒杀速度，请确定淘宝账号已经登陆，以及已经切换好中文输入法(一般验证答案都是输入中文字)。'
		+'</span>'
		+'</div>'
		+'</div>',
  success: function(layero, index){//启动成功的时候，自动调用的回调函数！
			$(layero).css('z-index','999999999');
			$('.layui-layer-ico').css('background','url("'+chrome.extension.getURL("include/layer/skin/default/icon.png")+'") no-repeat');
			$('.layui-layer-ico').css('background-position','0 -40px');
			var time_distance=timeOut;//显示倒计时效果
			refTime(time_distance);
			setTimeout(
				function(){
					//refTime(time_distance);
					time_distance=time_distance-(1000+nextSecGap);
					var taskId=setInterval(
						function(){
							refTime(time_distance);
							time_distance=time_distance-1000;
							if(time_distance<0){clearInterval(taskId);}
						},1000);
					debug('-->还剩下 '+parseInt(time_distance/1000)+' 秒系统秒杀购买...');
				}
				,nextSecGap
			);
			if(timeOut-miaoDealTime>0){
				setTimeout(
					function(){
						debug('秒杀之前先自动刷新!');
						sessionStorage.setItem('timeOutBuy','Y');//timeOutBuy的标识改为Y。说明下次刷新直接就进入到购买了。
						sessionStorage.setItem('bookTimeBuy',bookTimeBuy);
						layer.close(index);
						location.reload();}
					,(timeOut-miaoDealTime));//到点之后的一分钟之前自动刷新
			}
		},
	cancel: function(index){
			layer.close(index);
			showAlert(
			'提示：本次秒杀购物已经停掉!<br/>请点确定按钮，自动刷新该界面！'
			,function(){
				location.reload();//关闭后的操作
			});
		} 
});
}

function getMiaoLayer(bookTimeBuy){//定义获取miao输入界面的函数
	var miaoLayer=''
		+'<div style="padding:10px;font-size:12px;">'
		+'	<div id="miaoQuestion" style="width:900px;height:220px">'
		+'    <div id="miaoRemark" style="padding-left:100px;padding-top:50px;font-size:13px" class="help-block">'
		+'     <h2 style="font-size:15px">请耐心等待秒杀的到来！</h2>'
		+'       <br/>一键购物助手正在为您点击秒杀刷新抢宝按钮！请确认先切换好中文输入法！'
		+'       <br/><span style="color:red"><b>注意:请不要关闭此页面或者刷新页面！！否则辅助秒杀的功能失效。切记。</b></span>'
		+'       <br/><B>秒杀时间：</B>'+bookTimeBuy
		+'       <br/><B>秒杀倒计时(秒): </B><span id="timeout"></span>'
		+'    </div>'
		+'	</div>'
		+'	<form class="boostrapTable form-horizontal" id="miaoForm" style="margin-top:20px;margin-right:20px" role="form" onkeypress="if(event.keyCode==13||event.which==13){document.getElementById(\'miao\').click();return false;}">'
		+'		<div class="form-group" style="width:900px">'
		+'			<label for="answer" class="col-sm-3 control-label">验证码答案</label>'
		+'			<div class="col-sm-9">'
		+'				<div class="input-group">'
		+'				  <input type="text" class="form-control" id="answer" placeholder="验证码答案"/>'
		+'				  <span class="input-group-btn">'
		+'					<button class="btn btn-default" type="button" id="miao">'
		+'					  <span>确认购买</span>'
		+'					</button>'
		+'				  </span>'
		+'				</div>'
		+'				<span class="help-block" id="miaoTips">提示：秒杀界面，请尽快输入答案！技巧：输入验证码答案直接按下回车按键即可提交！'
		//+'				<br/><b>输入耗时(s): <span id="keyinSec">0</span> 秒</b></span>'
		+'			</div>'
		+'		</div>'
		+'	</form>'
		+'</div>';
	return miaoLayer;
}


