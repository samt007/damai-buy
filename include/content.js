define("./content", ["../widgets/utils/utils", "../widgets/config/config", "../widgets/utils/background", "../widgets/option/default", "../widgets/option/page", "../widgets/rob/buy", "../widgets/rob/runtime"],
function(require) {
    console.log('init!!');
	var bg = require("../widgets/utils/background"),
	defaults = require("../widgets/option/default"),
	page = require("../widgets/option/page"),
	runtime = require("../widgets/rob/runtime"),
	buy = require("../widgets/rob/buy"),
	order = require("../widgets/rob/order"),
	injectDom = require("../widgets/inject/dom"),
	host=runtime.getDomainFromUrl(),
	sour = 'unknown',chooseRealname = 'Y';
	window.runtime = runtime;
	host.indexOf('piao.damai.cn') !== -1 ? sour = 'buyPage' : (host.indexOf('buy.damai.cn') !== -1 ? sour = 'orderPage' : sour = 'unknown');
	console.log('host:',host,'sour:',sour);
	//page.options.host = host, page.options.sour = sour;
	bg.getItem(defaults,function(value){
		var options = $.extend({}, defaults, value); 
		runtime.setTimeGap(options.timeGap);
		console.log('options:', options);
		console.log('computerTime:'+new Date().formatMS());
		console.log('serverTime:'+runtime.nowFormatMS());
		sour === 'buyPage' && injectDom.buyPageCrack(function(){
			if(sessionStorage['autoBuy']=='Y'){
				var curTimes = parseInt(sessionStorage['buyPageRetryTimes']);
				++curTimes>parseInt(options.buyPageMaxRetryTimes) ? !function(){
					page.clearSessionStorage();
					showAlert('提示：本次自动下单重试次数超过'+options.buyPageMaxRetryTimes+'次，系统自动停止!');
				}() : !function(){
					console.log('第',curTimes,'次插件尝试重新下单！');
					sessionStorage['buyPageRetryTimes'] = curTimes;
					page.getFormSessionStorage();//page.options = JSON.parse(sessionStorage['pageOptions']);
					console.log('autoBuy',page,',retry times',sessionStorage['buyPageRetryTimes']);
					buy.autoChooseOptions(page.options.chooseOptions,function(){
						buy.monitor(page, function(){
							console.log('click at:'+runtime.nowFormatMS());
							page.flushTagStorage(function(){//必须要存到tag里面才可以跨域
								console.log('--->buyPage点击下单按钮时间：'+runtime.nowFormatMS());
								page.options.clickBuy=='Y' ? $("#btnBuyNow")[0].click():!function(){
									page.clearSessionStorage();
									page.clearTagStorage();
									showAlert('提示：设置不自动下单，大麦下单助手工作完成！!');
								}()
							})
						})
						injectDom.buyPageShowRemain(sour,page.options.buyRealname,page.options.bookTimeBuyMS,options,buy,page);
					})
				}()
			}
			injectDom.buyPageBookButton(function(){
				$('#m-certification-a').length>0?(chooseRealname='Y'):(chooseRealname='N');
				console.log('chooseRealname',chooseRealname);
				injectDom.buyPageBookTime(sour,options,function(bookTimeBuy,buyRealname){
					page.options=options,
					page.options.bookTimeBuy=bookTimeBuy,
					page.options.buyRealname=buyRealname,
					page.options.leadTimeOfBookTime=parseInt(options.leadTimeOfBookTime),
					page.options.delayTimeOfBookTime=parseInt(options.delayTimeOfBookTime),
					page.options.baiduOcrKeys=JSON.parse(options.baiduOcrKeys),
					page.options.bookTimeBuyMS=new Date(bookTimeBuy).getTime(),
					page.options.chooseRealname=chooseRealname,
					page.options.chooseOptions=buy.getPageChooseOptions();
					console.log('bookBuy',page);
					page.flushSessionStorage();//sessionStorage.setItem('pageOptions',JSON.stringify(page.options));
					buy.monitor(page, function(){
						console.log('click at:'+runtime.nowFormatMS());
						page.flushTagStorage(function(){//必须要存到tag里面才可以跨域
							console.log('--->buyPage点击下单按钮时间：'+runtime.nowFormatMS());
							page.options.clickBuy=='Y' ? !$("#btnBuyNow")[0].click()&&!page.clearSessionStorage():!function(){
								page.clearSessionStorage();
								page.clearTagStorage();
								showAlert('提示：设置不自动下单，大麦下单助手工作完成！!');
							}()
						})
					})
					injectDom.buyPageShowRemain(sour,buyRealname,page.options.bookTimeBuyMS,options,buy,page);
				});
			});
		});
		
		sour === 'orderPage' && options.pageOptions && !function(){
			console.log('--->orderPage开始处理自动下单！时间：'+runtime.nowFormatMS());
			page.options = JSON.parse(options.pageOptions||'{}');
			order.setPage(page);
			page.options.chooseRealname=='Y' ? !function(){
			console.log('orderPageRealnameDeal 开始自动选择购票人...时间：'+runtime.nowFormatMS());
			order.orderPageRealnameDeal(function(type){
				console.log('orderPageRealnameDeal 自动选择购票人执行完毕:'+type+'...时间：'+runtime.nowFormatMS());
				order.clickOrderConfirmBtn(function(){
					console.log('clickOrderConfirmBtn 执行完毕...时间：'+runtime.nowFormatMS());
					order.slidetounlock(function(){
						console.log('slidetounlock 执行完毕...时间：'+runtime.nowFormatMS());
						setTimeout(function(){
							console.log('getCaptchaImgOcr 开始执行...时间：'+runtime.nowFormatMS());
							order.getCaptchaImgOcr(function(data){
							console.log('getCaptchaImgOcr 执行完毕...时间：'+runtime.nowFormatMS());
							order.clickCaptchaImg(data,function(){
								console.log('clickCaptchaImg 执行完毕...时间：'+runtime.nowFormatMS());
								order.getCaptchaImgResult(data,function(){
									console.log('getCaptchaImgResult 执行完毕...时间：'+runtime.nowFormatMS());
								});
							})
							})
						},200)//避免出现错误：操作太快，请稍后再试
					})
				})
			},function(){ alert('找不到购票人按钮处理对象！请自行到界面下单！') })
			}():!function(){//不需要选择购票人
				console.log('clickRealnameBtn不需要选择购票人！时间：'+runtime.nowFormatMS());
				order.clickOrderConfirmBtn(function(){
					order.slidetounlock(function(){
						setTimeout(function(){
							order.getCaptchaImgOcr(function(data){
							//console.log('ok to get ocr data:'+JSON.stringify(data));
							order.clickCaptchaImg(data,function(){
								order.getCaptchaImgResult(data,function(){
									//order.clickOrderConfirmBtn();
								});
							})
							})
						},500)//避免出现错误：操作太快，请稍后再试
					},function(){//不需要滑动验证
						console.log('不需要滑动验证');
					})
				})
			}()
		}()
	});
});
define("../widgets/option/default", [],
function(a, b, c) {//后台的配置的属性，静态的
    c.exports = {
		apiHost: 'http://erptest.xinyiglass.com:8000',   //http://kqmai.com  http://192.168.88.123:8088  http://jebms.xwtw.com:8888 http://erptest.xinyiglass.com:8000
        leadTimeOfBookTime: '800',//下单提前期：提前多少毫秒点击下单的按钮。
		delayTimeOfBookTime: '0', //下单滞后期：延迟多少毫秒点击下单的按钮。
		timeGap: '0',
		debugMode:'N',
		pageOptions: '',
		baiduOcrKeys: '',
		buyPageMaxRetryTimes: '10',//自动下单最多重试次数
		clickBuy:'Y',//自动点击立刻购买按钮
		clickOrder:'Y',//自动点击提交订单按钮
    }
});
define("../widgets/option/page", ["../utils/background"],
function(r, b, c) {//页面的属性，动态的，也是后面的自动下单功能需要用到的
    var page = function(){//就是理解为构造函数了：https://www.cnblogs.com/pizitai/p/6427433.html
		this.options = {}
		//bookTimeBuy: 预约下单时间 buyRealname: 购票人 bookTimeBuyMS: 预约时间毫秒
	},
	bg = r("../utils/background");
	page.prototype = {
		flushSessionStorage: function() {//记录信息到session，当页面刷新的时候还可以自动下单！
			var a = this;
			!sessionStorage.setItem('autoBuy','Y') && !sessionStorage.setItem('pageOptions',JSON.stringify(a.options)) && !sessionStorage.setItem('buyPageRetryTimes','0');
		},
		getFormSessionStorage: function() {
			var a = this;
			a.options=$.extend(!0, a.options, JSON.parse(sessionStorage['pageOptions']))
		},
		clearSessionStorage: function(callback) {
			var a = this;
			!sessionStorage.setItem('autoBuy','N') && !sessionStorage.setItem('pageOptions','') && !sessionStorage.setItem('buyPageRetryTimes','0');
		},
		flushTagStorage: function(callback) {
			var a = this;
			bg.setItem('pageOptions', JSON.stringify(a.options), callback);
		},
		clearTagStorage: function(callback) {
			var a = this;
			bg.setItem('pageOptions', '', callback);
		}
	}
	c.exports = new page;
});
define("../widgets/rob/buy", ["../utils/utils", "../utils/Event", "../config/config"],
function(l, h, g) {
    var f = l("../utils/utils"),
    d = l("../utils/Event"),
    b = l("../config/config");
    j = f.inherits(d, {
        constructor: function() {
            d.call(this);
			this.timer = null;
        },
        monitor: function(page,callback) {//监控时间
            var a = this
			   ,to = (page.options.bookTimeBuyMS-runtime.now()-page.options.leadTimeOfBookTime+page.options.delayTimeOfBookTime)
			   ,to = to<0 ? 0 : to;
			this.timer = setTimeout(function(){
				callback && callback();
			},to);
			console.log(to+' ms 后执行下单动作！定时器:'+this.timer);
        },
		stopMonitor: function(){
			this.timer && !clearTimeout(this.timer);
			console.log('停止执行下单的定时器 ',this.timer);
		},
		getPageChooseOptions: function(){
			var performList=[],//演出时间，位置法
			priceList=[],//选择票价，用位置法定位
			cartList=[];//选择数量，对应位置的数量。默认是1
			$('#performList ul>li').each(function(i,o){
				$(o).hasClass('itm-sel') && performList.push(i);
			})
			$('#priceList ul>li').each(function(i,o){
				$(o).hasClass('itm-sel') && priceList.push(i);
			})
			$('#cartList ul>li').each(function(i,o){
				cartList.push(parseInt($(o).find('input').val()));
			})
			//console.log(performList,priceList,cartList)
			return {"performList":performList,"priceList":priceList,"cartList":cartList}
		},
		autoChooseOptions: function(chooseOptions,callback){
			if(!chooseOptions){
				alert('chooseOptions为空！程序中断！');
				return;
			}
			f.populateDom('#performList ul>li a','performList',100,50,function(dom){
				var $perform = $($('#performList ul>li')[chooseOptions.performList[0]]);
				!$perform.hasClass('itm-sel') && $perform.find('a')[0].click();
				setTimeout(function(){
					f.populateDom('#performList ul>li.itm-sel a','itm-sel-performList',100,50,function(dom){
						setTimeout(function(){
							for(var pricePos of chooseOptions.priceList){
								console.log('pricePos',pricePos);
								var $price = $($('#priceList ul>li')[pricePos]);
								!$price.hasClass('itm-sel') && $price.find('a')[0].click();
							}
							f.populateDom('#cartList ul>li input','cartList',100,50,function(){
								for(var cartIdx in chooseOptions.cartList){
									console.log('cartIdx',cartIdx,chooseOptions.cartList[cartIdx]);
									$($('#cartList ul>li')[cartIdx]).find('input').val(chooseOptions.cartList[cartIdx]);
								}
								callback && callback();
							},function(){
								alert('自动选择购物车失败！找不到dom操作！');
							})
						},0);
					},function(){
						alert('自动下单失败！未选择演出时间！');
					})
				},0);
			},function(){
				alert('自动下单失败！找不到dom操作！');
			});
			
		}
    });
    g.exports = new j
});
define("../widgets/rob/order", ["../utils/utils", "../utils/Event", "../config/config", "../utils/background", "../inject/dom", "../option/page", "../utils/BaiduOcr"],
function(l, h, g) {
    var f = l("../utils/utils"),
    d = l("../utils/Event"),
    b = l("../config/config"),
    bg= l("../utils/background"),
	injectDom = l("../inject/dom"),
	bocr = l("../utils/BaiduOcr"),
	p = l("../option/page");
    j = f.inherits(d, {
        constructor: function() {
            d.call(this);
			this.timer = null;
			this.maxTimes = 5;
			this.curOcrTimes = 1;//获取ocr结果的重试次数
			this.curClickTimes = 1;//点击图片的重试次数
			this.page = p;//这里只是默认值！实际值必须要初始化。因为它携带了页面所需要的参数！
        },
		setPage: function(page){
			this.page = page;
			console.log('setPage:',this.page);
		},
		orderPageRealnameDeal: function(callback,failCallback){//自动操作购票人
			var maxTimes = 50, curTimes = 0, l = this,
			realnameTaskId = setInterval(function(){
				console.log(curTimes);
				var $realnameBtnDom1 = $('.m-panel-realname a.u-btn-rds'),$realnameBtnDom2=$('.hd-1 a.u-btn-rds'),$realnameBtnDom,type,doneCnt=0,times=1,maxTimes=100;
				++curTimes<maxTimes ? !function(){
					$realnameBtnDom1.length>0 && ($realnameBtnDom=$realnameBtnDom1) && (type='realnameType1') && clearInterval(realnameTaskId);
					$realnameBtnDom2.length>0 && ($realnameBtnDom=$realnameBtnDom2) && (type='realnameType2') && clearInterval(realnameTaskId);
					$realnameBtnDom.each(function(i,o){//支持自动选择多个购票人
						!o.click() && l.chooseRealname(type,function(){
							console.log('chooseRealname 执行完毕...时间：'+runtime.nowFormatMS());
							l.confirmRealname(type,function(){
								console.log('confirmRealname 执行完毕...时间：'+runtime.nowFormatMS());
								doneCnt++;
							})
						})
					})
					!function n(){//另外发一个计时器判断前面是否处理完毕
						console.log('times:'+times,'doneCnt:'+doneCnt);
						doneCnt==$realnameBtnDom.length ? callback && callback(type) : setTimeout(function(){
							++times<=maxTimes ? n() : failCallback&&failCallback();
						},50)
					}()
				}():!function(){
					clearInterval(realnameTaskId);
					failCallback&&failCallback();
				}()
			},100);
		},
		chooseRealname: function(type,callback){
			var l = this;
			console.log('this Page:',l.page);
			! function(e,t){
				var i=1;
				! function n(){
					var $chooseDom,inputSelector,maxChooseRealnames=1;
					if(type=='realnameType1'){
						$chooseDom=$('.one-table>.one-tb>table>tbody>tr[ms-on-click="@modal.config_realname.onlinkage(el)"]');
						inputSelector='input[type="radio"]';
						maxChooseRealnames=1;
					}else{
						$chooseDom=$('.one-table>.one-tb>table>tbody>tr[ms-class="@isClass2[$index]"]');
						inputSelector='input[type="checkbox"]';
						var chooseNameCountText=$($('.hd-1 span label')[3]).html(),
						chooseNameCount=chooseNameCountText&&chooseNameCountText.split('，')[1].replace('本次需要选择','').replace('位常用购票人','');
						console.log(chooseNameCountText,chooseNameCount);
						!isNaN(chooseNameCount) && (maxChooseRealnames=parseInt(chooseNameCount));
					}
					$chooseDom.length >0 ? !function(){
						var chooseFlag=false,beitai//beitai备胎，你懂的
						,buyRealnameList=l.page.options.buyRealname?l.page.options.buyRealname.replace('，',',').split(','):[]
						,chooseCount=0;
						console.log('buyRealnameList',buyRealnameList);
						l.page.options.buyRealname ? !function(){
							$chooseDom.each(function(i,o){//console.log(i,o)
								if($(o).has(inputSelector).length>0){
									beitai===undefined && (beitai=o);
									var htmlStr=$(o).html();
									for(var curRealname of buyRealnameList){
										if(htmlStr.indexOf(curRealname) !== -1){
											$(o).find(inputSelector)[0].click();
											chooseFlag=true;
											console.log('选择了',curRealname);
											chooseCount++;
											if(chooseCount>=maxChooseRealnames){
												console.log('已经选择人数',chooseCount,'>=可选择人数',maxChooseRealnames,'程序退出');
												return false;
											} 
										}
									}
								}
							})
							chooseFlag===false && $(beitai).find(inputSelector)[0].click();
							callback && callback();
						}() : !function(){
							$($chooseDom[0]).find(inputSelector)[0].click();
							callback && callback();
						}()
					}() : setTimeout(function(){
						console.log(i + ' times to loop get the chooseRealname ...');
						i++, i<=t ? n() : alert('选择购票人出现错误！找不到dom操作！');
					},e)
				}()
			}(100,60)
		},
		confirmRealname: function(type,callback){
			var confirmSelector;
			type=='realnameType1'?(confirmSelector='p.one-btn a'):(confirmSelector='a.u-btn-c5[ms-on-click="@modal.config_fastbuy.onConfirm()"]')
			//console.log('confirmSelector',confirmSelector);
			f.populateDom(confirmSelector,'confirmBtn',100,30,function(dom){
				!dom.click() && callback && callback();
			},function(){
				alert('确认购票按钮失败！找不到dom操作！');
			});
		},
		clickOrderConfirmBtn: function(callback){
			f.populateDom('#orderConfirmSubmit','orderConfirmBtn',100,30,function(dom){
				!dom.click() && callback && callback();
			},function(){
				alert('确认订单按钮失败！找不到dom操作！');
			});
		},
		slidetounlock: function(callback,failCallback){//破解滑动验证
			f.populateDom('#nc_1__scale_text','slidetounlock',100,30,function(dom){
				var obj = document.getElementById('nc_1_n1z')//移动元素
				,box = document.getElementById('nc_1_n1t')//移动元素所在的区间
				,boxRect = box.getBoundingClientRect()//区间的坐标
				,curLeft=boxRect.left + obj.offsetLeft
				,down = createEvent('mousedown', boxRect.left + obj.offsetLeft+5, boxRect.top + obj.offsetTop-5)
				,up = createEvent('mouseup')
				,rand=100+10*randomNumber(1,10)+randomNumber(1,10);
				setTimeout(function(){document.dispatchEvent(createEvent('mousedown',boxRect.left+obj.offsetLeft-randomNumber(10,20),boxRect.top+obj.offsetTop-randomNumber(20,30)));},10);
				setTimeout(function(){document.dispatchEvent(createEvent('mousedown',boxRect.left+obj.offsetLeft-randomNumber(1,10),boxRect.top+obj.offsetTop-randomNumber(15,30)));},50);
				setTimeout(function(){obj.dispatchEvent(down);},100);
				setTimeout(function(){curLeft=curLeft+rand; document.dispatchEvent(createEvent('mousemove',curLeft,boxRect.top+obj.offsetTop));},200);
				setTimeout(function(){curLeft=curLeft+284-rand; document.dispatchEvent(createEvent('mousemove',curLeft,boxRect.top+obj.offsetTop));},250);
				setTimeout(function(){obj.dispatchEvent(up);},300);
				callback && callback();
			},failCallback);
		},
		getCaptchaImgOcr: function(callback){
			var l = this;
			f.populateDom('#nc_1_clickCaptcha .clickCaptcha_img img','getCaptchaImg',100,40,function(dom){
				f.populateDom('#nc_1__scale_text i','getCaptchaImgChar',10,50,function(domText){
					var account = 'samt007'
					   ,question = $('#nc_1__scale_text').html().replace('<i>','').replace('</i>','')
					   ,imageChar = $('#nc_1__scale_text i').html().replace('“','').replace('”','')
					   ,imageStr = $(dom).attr('src').split("base64,")[1]
					   ,t = + new Date
					   ,load = injectDom.showLoading('<b>请耐心等候...插件正在努力破解验证码中.....</b>');
					console.log('------->question:',question);
					bocr.setBaiduOcrKeys(l.page.options.baiduOcrKeys);
					bocr.getiImageOcr(imageStr,function(data){
						console.log('bocr.getiImageOcr 执行耗时:',(+ new Date - t));
						var retry=true;
						layer.close(load);
						//分析结果，返回图片文字位置
						data.words_result_num>0 && !function(){
							for(var wr of data.words_result){
								for(var c of wr['chars']){
									//console.log(wr,c);
									if(c.char == imageChar){
										var ret = {
											"charLeft": c.location.left,
											"charWidth": c.location.width,
											"charTop": c.location.top,
											"charHeight": c.location.height,
											"account": account,
											"question": question,
											"imageChar": imageChar,
											"imageStr": imageStr
										}
										retry=false, callback && callback(ret);
									}
								}
							}
						}();
						retry && 
						(l.curOcrTimes++,l.curOcrTimes<=l.maxTimes && !function(){
							console.log('ocr识别找不到',imageChar,'字，系统准备重试！');
							$('#nc_1__btn_2')[0].click();
						}() ? !setTimeout(function(){l.getCaptchaImgOcr(callback)},300)
						: !alert("提示："+l.maxTimes+"次获取百度ocr信息失败！请您手动下单！"));//自动重试
					});
				},function(){alert('获取验证图片问题失败！找不到dom操作！')});
			},function(){alert('获取验证图片失败！找不到dom操作！')});
		},
		clickCaptchaImg: function(data,callback){//自动点击图片，最后一步了，真艰辛啊！
			var img = document.getElementsByClassName('clickCaptcha_img')[0].getElementsByTagName('img')[0];
			var imgRect = img.getBoundingClientRect();//区间的坐标
			var offX=Math.floor((data.charLeft+data.charWidth/2)/200*230)
			   ,offY=Math.floor((data.charTop+data.charHeight/2)/200*230)
			   ,leftPos=imgRect.left+offX
			   ,topPos=imgRect.top+offY;
			console.log(offX,offY);
			//通过不断的测试发现，如果用代码点击，会导致offsetX和offsetY获取出异常！只好用代码修正它！
			Object.defineProperties(MouseEvent.prototype, {
			  offsetX: {
				get: function() {
				  return (offX&&offX>0)?(offX):(this.clientX - this.target.getBoundingClientRect().left);
				}
			  },
			  offsetY: {
				get: function() {
				  return (offY&&offY>0)?(offY):(this.clientY - this.target.getBoundingClientRect().top);
				}
			  }
			});
			setTimeout(function(){img.dispatchEvent(createEvent('mousedown', imgRect.left-10, imgRect.top-15))},250);
			setTimeout(function(){img.dispatchEvent(createEvent('mousemove', leftPos, topPos))},300);
			setTimeout(function(){img.dispatchEvent(createEvent('mouseup', leftPos, topPos))},400);
			setTimeout(function(){
				img.dispatchEvent(createEvent('click', leftPos, topPos)),(callback && callback());
			},500);
		},
		getCaptchaImgResult: function(data,callback){
			var l = this;
			console.log('getCaptchaImgResult this Page:',l.page);
			f.populateDom('#nc_1__scale_text span[data-nc-lang="_yesTEXT"]','getCaptchaImgResult',200,10,function(dom){
				setTimeout(function(){
					console.log('--->图片验证通过，自动点击确认按钮时间：'+runtime.nowFormatMS());
					l.page.options.clickOrder=='Y' ? $('.m-modal button[ms-on-click="@tongdunModal.onConfirm()"]')[0].click()
					:!function(){
						showAlert('提示：设置不自动提交订单，大麦下单助手工作完成！!');
					}()
					bg.ajax({
						async: true,
						type: 'post', 
						data: JSON.stringify(data),
						contentType: 'application/json;charset=UTF-8',
						url: l.page.options.apiHost+'/quick-buy/fnd/damai/addQuestionResult',
						dataType:'json',
						success: function (data) {
							console.log(data);
						},
						error: function (e) {
							console.log(e);
						}
					})
					l.page.clearTagStorage(), callback && callback();
				},100)
			},function(){
				console.log(l.curClickTimes+' 次点击图片信息失败！');
				l.curClickTimes++,l.curClickTimes<=l.maxTimes ? l.getCaptchaImgOcr(function(data){
					l.clickCaptchaImg(data,function(){
						l.getCaptchaImgResult(callback);
					})
				}) : !showAlert('提示：点击验证图片失败！请重新预约！');
			});
		}
    });
    g.exports = new j
});
define("../widgets/utils/BaiduOcr", ["../utils/utils", "../utils/background"],
function(b, c, a) {
	var f = b("../utils/utils"),
	bg= b("../utils/background"),
    d = function() {
        this.AUTH_HOST = "https://aip.baidubce.com/oauth/2.0/token",
		this.clientId = "",//"so4uSuzSstsbrxw8kXgCN5nc",
		this.clientSecret = "",//"zuxtZ7BZYHZZMZxpVprdR3wolKNEhKlS",
		this.accessToken = "",//"24.ba67b4ba828885b0d47c05edea97a799.2592000.1532695880.282335-11452461",
		this.MAX_TOKEN_TIMES = 2,
		this.tokenTimes = 0,
		this.MAX_RETRY_TIMES = 10,
		this.retryTimes = 0,
		this.baiduOcrKeys = [];
    };
    d.prototype = {
		setBaiduOcrKeys: function(keys){
			this.baiduOcrKeys = keys;
			console.log('setBaiduOcrKeys:',this.baiduOcrKeys);
		},
        getiImageOcr: function(i, callback) {
            if(!this.clientId || !this.clientSecret){
				this.setOcrKey("");
				//console.log('getNextOcrKey:',this.getNextOcrKey());
			}
			if(!this.accessToken){
				alert('token获取失败！');
				return false;
			}
			var l = this;
			bg.ajax({
				async: true,
				type: 'post', 
				data: f.objToUrl({
					"image": encodeURIComponent(i)
					,"detect_direction": true
					,"recognize_granularity": "small"
					,"probability": true
				}),
				contentType: 'application/x-www-form-urlencoded',
				url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/accurate?access_token='+l.accessToken,
				dataType:'json',
				success: function (data) {
					console.log('getiImageOcr',data);
					if(data["error_code"]=='110'||data["error_code"]=='111'){//如果token过期了，则需要重新获取//{"error_msg":"Access token invalid or no longer valid","error_code":110}
						console.log("need to ref the token ! times:"+l.tokenTimes);
						l.tokenTimes++;
						if(l.tokenTimes>=l.MAX_TOKEN_TIMES) {
							alert("递归找TOKEN次数超过("+l.MAX_TOKEN_TIMES+")次，程序退出！");
							return false;
						}
						l.getAuth(l.clientId,l.clientSecret,function(token){
							console.log('new token:',token);
							l.baiduOcrKeys[0]['accessToken']=token,
							l.setRedisOcrKey(l.baiduOcrKeys),
							l.accessToken=token,
							setTimeout(function(){l.getiImageOcr(i, callback)},200);//自我递归调用
						})
					}else if(data["error_code"]=='17'){//{"error_msg":"Open api daily request limit reached","error_code":17}
						l.setOcrKey("getNextKey");
						setTimeout(function(){l.getiImageOcr(i, callback)},200);//自我递归调用
					}else if(data["error_code"]=='18'){//{"error_msg":"Open api qps request limit reached","error_code":18}
						console.log("need to retry ! times:"+l.retryTimes);
						l.retryTimes++;
						if(l.retryTimes>=l.MAX_RETRY_TIMES){
							alert("递归重试次数超过("+l.MAX_RETRY_TIMES+")次，程序退出！");
							return false;
						}
						setTimeout(function(){l.getiImageOcr(i, callback)},200);//自我递归调用
					}else{
						l.retryTimes = 0;
						l.tokenTimes = 0;
						callback && callback(data);
					}
				},
				error: function (e) {
					console.log(e);
					alert("提示：获取百度ocr信息失败！请检查服务器服务状态后稍后重试！");
				}
			})
        },
        setOcrKey: function(getType) {
			var ocrKey = this.getRedisOcrKey();
			console.log("getOcrKey-->ocrKey",ocrKey);
			if(!ocrKey){
				console.log("getOcrKey-->First time to get the key");
				ocrKey = this.getNextOcrKey();
			}else{
				if(getType == "getNextKey"){
					console.log("getOcrKey-->Get the next key");
					ocrKey = this.getNextOcrKey();
				}else{
					console.log("getOcrKey-->Get the current key");
				}
			}
			this.clientId =ocrKey.apiKey;
			this.clientSecret = ocrKey.secretKey;
			this.accessToken = ocrKey.accessToken;
        },
		getNextOcrKey: function(){
			var newbaiduOcrKeys = this.baiduOcrKeys.slice(1);
			console.log('getNextOcrKey',this.baiduOcrKeys,newbaiduOcrKeys);
			if(newbaiduOcrKeys.length==0){
				alert("找不到可用的key列表，或者可用的key已经没有！当天的免费ocr次数已经用光！");
				return false;
			}
			this.setRedisOcrKey(newbaiduOcrKeys);
			return getRedisOcrKey();
		},
		setRedisOcrKey: function(keys){
			this.baiduOcrKeys = keys;
			bg.setLocalStorage('baiduOcrKeys', JSON.stringify(keys));
		},
		getRedisOcrKey: function(){
			return this.baiduOcrKeys[0];
		},
		getAuth: function(ak, sk, callback){
			 // 获取token地址
			var getAccessTokenUrl = this.AUTH_HOST + "?grant_type=client_credentials" + "&client_id=" + ak + "&client_secret=" + sk;
			try{
				bg.ajax({
					async: true,
					type: 'get', 
					data: '',
					contentType: 'application/x-www-form-urlencoded',
					url: getAccessTokenUrl,
					dataType:'json',
					success: function (data) {
						console.log('getAuth',data);
						callback && callback(data["access_token"]);
					},
					error: function (e) {
						console.log('获取token失败！信息：',e);
					}
				})
			}catch(e){
				console.log(e)
				return '';
			}
		}
    },
    a.exports = new d
});
define("../widgets/config/config", [], //定义当前页面需要用到的sessionStorage的key
function(a, b, c) {
    c.exports = {
        //DEBUG: true,//!1
        PRICE_NOTIFY_KEY: "price_notify_key",
        STOCK_NOTIFY_KEY: "stock_notify_key",
        ROB_NOTIFY_KEY: "rob_notify_key",
        LOGISTICS_NOTIFY_KEY: "logistics_notify_key",
        COIN_SWITCHER: "coin_switcher",
        NOT_SHOW_MORE_TIPS: "not_show_more_tips",
        AUTO_ROB_SWITCHER: "auto_rob_switcher",
        TEMP_PARAMS_KEY: "temp_params_key"
    }
});
define("../widgets/rob/runtime", ["../utils/utils", "../utils/Event", "../config/config"],
function(l, h, g) {
    var f = l("../utils/utils"),
    d = l("../utils/Event"),
    b = l("../config/config");
    j = f.inherits(d, {
        constructor: function() {
            d.call(this),
            this.preKey = "auto_rob_list",
            this.storageKey = this.preKey,
            this.cache = [],
            this.timer = null,
            this.timeGap = 0,
            this.interval = 1000,
            this.recentStamp = 0,
            this.remainStamp = 0
        },
        init: function() {
            var a = this;
            a.clear(),
			a.storageKey = a.preKey + "_" + hex_md5(n);
			var c = localStorage[a.storageKey];
			a.cache = "undefined" != typeof c ? JSON.parse(c) : [],
			"false" != localStorage[b.AUTO_ROB_SWITCHER] && a.start()
        },
        clear: function() {
            var a = this;
            a.cache = [],
            a.storageKey = a.preKey
        },
        start: function() {
            console.log("started!!!!!"),
            this._countdown()
        },
        stop: function() {
            console.log("stopped!!!!!"),
            this.timer && clearInterval(this.timer)
        },
        create: function(c, n) {
            var a = this;
            k.create(c,
            function(e) {
                "0" == e.errno && (e.data = $.extend(!0, c, e.data), a._add(e.data)),
                n && n(e)
            })
        },
        _countdown: function() {
            var a = this;
			//这里是预约执行的代码！！
        },
        _status: function(c) {
            var o = this,
            a = c.errno,
            p = c.order;
            "0" == a ? p.pay = !0 : p.fail = !0,
            o._flush()
        },
        _expired: function(c) {
            for (var p = this,
            a = 0; a < c.length; a++) {
                for (var r = c[a], q = 0; q < p.cache.length; q++) {
                    p.cache[q].idSelector == r.idSelector && (p.cache[a].expired = !0)
                }
            }
            p._flush()
        },
        _add: function(c) {
            for (var p = this,
            a = p.cache,
            r = !1,
            q = 0; q < a.length; q++) {
                if (a[q].idSelector == c.idSelector) {
                    a[q] = c,
                    r = !0;
                    break
                }
            }
            r || p.cache.unshift(c),
            p._flush()
        },
        _stamp: function() {
            var c = this,
            o = c.now(),
            a = 1415635200000,
            p = 1447171200000;
            return o //o > a ? p: a
        },
        _flush: function() {
            var a = this;
            localStorage[a.storageKey] = JSON.stringify(a.cache)
        },
        setTimeGap: function(a) {
            this.timeGap = Math.floor(parseInt(a))
        },
        now: function() {
            return  + new Date + this.timeGap
        },
        nowFormatMS: function() {
            return (new Date(this.now())).format("yyyy-MM-dd hh:mm:ss.S")
        },
        nowFormatDT: function() {
            return (new Date(this.now())).format("yyyy-MM-dd hh:mm:ss")
        },
		getDomainFromUrl: function(){
			 var host = "null";
			 if(typeof url == "undefined" || null == url) url = window.location.href.split('&')[0];
			 var regex = /.*\:\/\/([^\/]*).*/;
			 var match = url.match(regex);
			 if(typeof match != "undefined" && null != match) host = match[1];
			 return host;
		}
    });
    g.exports = new j
});
define("../widgets/utils/Timer", [],
function(b, c, a) {
    var d = function() {
        this.timer = null
    };
    d.prototype = {
        start: function(g, h) {
            var f = this;
            f.timer = setTimeout(function() {
                h(),
                f.start(g, h)
            }, g())
        },
        stop: function() {
            this.timer && clearTimeout(this.timer)
        }
    },
    a.exports = d
});
define("../widgets/utils/utils", [],
function(b, a, d) {
    var c = {};
    ! function(g) {
        g.copy = function(h) {
            return JSON.parse(JSON.stringify(h))
        };
        var f = null;
        g.createObject = function(i) {
            var h;
            return Object.create ? Object.create(i) : (h = function() {},
            h.prototype = i, new h)
        },
        g.inherits = function(e, j, i) {
            var h;
            return "function" == typeof j ? (h = j, j = null) : h = j && j.hasOwnProperty("constructor") ? j.constructor: function() {
                return e.apply(this, arguments)
            },
            $.extend(h, e, i || {}),
            h.__super__ = e.prototype,
            h.prototype = g.createObject(e.prototype),
            h.prototype._super = e,
            j && $.extend(!0, h.prototype, j),
            h
        },
        g.route = function(i, h) {
            window.location.href.match(i) && "function" == typeof h && h()
        },
        g.supportCss3Feature = function(l) {
            var j = ["webkit", "Moz", "ms", "o"],
            p = [],
            m = document.documentElement.style,
            k = function(i) {
                return i.replace(/-(\w)/g,
                function(o, n) {
                    return n.toUpperCase()
                })
            };
            for (var h in j) {
                p.push(k(j[h] + "-" + l))
            }
            p.push(k(l));
            for (var h in p) {
                if (p[h] in m) {
                    return ! 0
                }
            }
            return ! 1
        },
        g.addStyle = function(l, j) {
            var q, m = document,
            k = m.getElementsByTagName("head")[0],
            h = m.createElement("style");
            if (h.setAttribute("type", "text/css"), j && h.setAttribute("id", j), window.attachEvent) {
                k.appendChild(h),
                q = h.styleSheet,
                q.cssText = l
            } else {
                try {
                    h.appendChild(m.createTextNode(l))
                } catch(p) {
                    h.cssText = l
                }
                k.appendChild(h),
                q = h.styleSheet ? h.styleSheet: h.sheet || m.styleSheets[m.styleSheets.length - 1]
            }
            return q
        },
        g.parseDate = function(l) {
            l = new Date(l);
            var j = l.getFullYear(),
            q = l.getMonth() + 1,
            m = l.getDate(),
            k = l.getHours(),
            h = l.getMinutes(),
            p = l.getSeconds();
            return q = q > 9 ? q: "0" + q,
            m = m > 9 ? m: "0" + m,
            k = k > 9 ? k: "0" + k,
            h = h > 9 ? h: "0" + h,
            p = p > 9 ? p: "0" + p,
            {
                year: j,
                month: q,
                day: m,
                hours: k,
                minutes: h,
                seconds: p
            }
        },
        g.parseStamp = function(j) {
            j = +j;
            var h = 1000,
            l = 60 * h,
            k = 60 * l,
            i = 24 * k;
            return {
                milliseconds: j % h,
                seconds: Math.floor(j % l / h),
                minutes: Math.floor(j % k / l),
                hours: Math.floor(j % i / k),
                days: Math.floor(j / i)
            }
        },
        g.getServerTime = function(i, h) {
            h(+new Date)
			/*$.ajax({
                url: i + "?_" + Math.random(),
                cache: !1,
                data: null,
                timeout: 10000,
                type: "GET"
            }).complete(function(j) {
                //alert(JSON.stringify(j));
				var rsp=JSON.parse(j.responseText);
				var k = parseInt(rsp.data.t);//+new Date(j.getResponseHeader("Date") || +new Date);
                h(k)
            })*/
        },
        g.dotting = function(h) {
            $.get(h + "?_=" + Math.random())
        },
		g.populateDom = function(selector,name,interval,maxTimes,callback,failCallback,breakFn){
			var i=1;
			//console.log($(selector));
			! function(e){
				breakFn&&breakFn()==true ? !console.log('-->'+i+' times get ('+name+') break!') :
				! function n(){
					var selDom=$(selector)[0];
					selDom !==undefined ? !function(){
						i==1 ? !console.log('-->'+i+' times get ('+name+') Dom onece.') : !console.log('-->'+i+' times get ('+name+') Dom interval.');
						callback && callback(selDom);
					}() : setTimeout(function(){
						i++,i<=maxTimes ? n() : failCallback&&failCallback();
					},e)
				}()
			}(interval)
		},
		g.objToUrl = function (j) {
			var k = [];
			for (var a in j) {
				k.push(a + "=" + (j[a] || "").toString())
			}
			return k.join("&")
		}
    } (c),
    Object.freeze(c),
    d.exports = c
});
define("../widgets/utils/Event", [],
function(c, b, d) {
    var a = function(g) {
        if (this._eventListeners = {},
        g && g.listeners) {
            for (var f in g.listeners) {
                this.on(f, g.listeners[f])
            }
        }
    };
    a.prototype = {
        fire: function(k, g) {
            if (null !== this._eventListeners && (g = g || {},
            this._eventListeners[k])) {
                g.evtTarget = this,
                g.evtName = k;
                for (var m = 0,
                f = this._eventListeners[k], l = f.length; l > m; m++) {
                    var j = f[m];
                    try {
                        j.call(this, g)
                    } catch(h) {
                        console.log(h)
                    }
                }
            }
        },
        on: function(g, f) {
            return this._eventListeners[g] || (this._eventListeners[g] = []),
            this._eventListeners[g].push(f),
            this
        },
        un: function(k, g) {
            if (this._eventListeners[k]) {
                for (var m = this._eventListeners[k], f = [], l = 0, j = m.length; j > l; l++) {
                    var h = m[l];
                    h != g && f.push(h)
                }
                this._eventListeners[k] = f
            }
            return this
        },
        __destroyListeners: function() {
            this._eventListeners = null
        }
		
    },
    d.exports = a
});
define("../widgets/utils/background", [],
function(c, b, d) {
    var a = {
		 getItem: function(key, callback){
			key && this.sendMessageBack(
				'get',
				{'key':key},
				function(response){
					response && response.status==200 && callback && callback(response.value);
				}
			 );
		 },
		 setItem: function(key, value, callback){
			 key && this.sendMessageBack(
				'set',
				{'key':key, 'value':value},
				function(response){
					response && response.status==200 && callback && callback(response);
				}
			 );
		 },
		 setJson: function(jsonObj, callback){
			 jsonObj && typeof jsonObj === 'object' && this.sendMessageBack(
				'setJson',
				jsonObj,
				function(response){
					callback && callback(response)
				}
			 );
		 },
		 delItem: function(key, callback){//删除功能，将对应的key的值删除
			 key && this.sendMessageBack(//通知background，要删除数据
				'del',
				{'key':key},
				function(response){
					response && response.status==200 && callback && callback(response);
				}
			 );
		 },
		 ajax: function(options){//发送给bg的ajax参数
			 options && this.sendMessageBack(
				'ajax',
				options,
				function(response){
					//console.log(response);
					//response && response.status==200 && callback && callback(response);
					response && response.status==200 ? options.success&&options.success(response.data) : options.error&&options.error(response.data);
				}
			 );
		 },
		 setLocalStorage: function(key, value, callback){
			 key && this.sendMessageBack(
				'setLocalStorage',
				{'key':key, 'value':value},
				function(response){
					response && response.status==200 && callback && callback(response);
				}
			 );
		 },
		/**
		 * 向background发送消息
		 * @params strAction string 执行方法
		 * @params dicData dict 数据字典
		 * @params callback function 回调函数
		 */
		 sendMessageBack: function(strAction, dicData, callback){
			 chrome.extension.sendMessage({'action':strAction, 'data':dicData},callback);
		 }
    }
    d.exports = a
});
define("../widgets/inject/dom", [],
function(c, b, d) {
    var a = {
		 buyPageCrack: function(callback){
			setTimeout(function(){
				if($('#toBeAboutTo')[0]){
					$('#performList ul').removeClass('lst-dis');
					//console.log($('#performList ul').attr('class'));
					$('#priceList ul').removeClass('lst-dis');
					$('#priceList ul li').removeClass('itm-oos');
					$('#cartList').css('display','block');
					callback && callback();
				}else{
					callback && callback();
				}
			},200)
		 },
		 buyPageBookButton: function(callback){
			 var html='<a class="u-btn u-btn-buynow" href="javascript:;" id="btnBookBuyNow" style="background-color:#ff6136;">一键预约</a>';
			 var html3='<a class="u-btn u-btn-buynow" href="javascript:;" id="btnBookBuyNow3" style="background-color:#ff6136;">一键预约</a>';
			 $('#btnBuyNow').after(html);
			 $('#btnBuyNow3').after(html3);
			 $('#btnBookBuyNow, #btnBookBuyNow3').on('click',function(e){
				 //console.log(e);
				 if($('.m-cart ul li').length==0){
					 $('#btnBuyNow')[0].click();
					 //alert('请选择属性！');
				 }else{
					 callback && callback();
				 }
			 })
		 },
		 buyPageBookTime: function(sour,options,yesCallback){
			layer.open({
				type: 1, //page层
				area: ['520px','350px'],
				title: '<B>大麦下单助手</B>',
				shade: 0.6, //遮罩透明度
				moveType: 1, //拖拽风格，0是默认，1是传统拖动
				shift: 0, //0-6的动画形式，-1不开启
				skin: 'layui-layer-rim', //加上边框
				zIndex:9147483647,
				content:'<div style="padding:20px;font-size:12px;">'
					+' <form class="boostrapTable form-horizontal" style="margin-top:20px;margin-right:20px" role="form">'
					+' <div class="form-group">'
					+' <label for="bookTimeBuy" class="col-sm-3 control-label">预约下单时间</label>'
					+' <div class="col-sm-9">'
					+'   <div class="input-group">'
					+'   <input type="text" class="form-control" id="bookTimeBuy" placeholder="预约下单时间">'
					+' 	<span class="input-group-btn">'
					+' 	<button class="btn btn-default" type="button" id="open"><span class="glyphicon glyphicon-calendar"></span></button>'
					+' 	</span>'
					+'  </div>'
					+'  <span class="help-block" id="miao-help">'
					//+'    <b>系统当前时间: </b><span id="sysDT"></span>'
					+'    <br/>购买时间点的逻辑是：如果预约下单时间<=系统当前时间，则执行立刻下单。否则将倒计时预约下单。'
					//+'    <span><br/><label for="orderBuyFlag">预约时间为实际下单时间：</label><input type="checkbox" id="orderBuyFlag"></span>'
					//+'    <span id="payBuyFlag-key"><br/><label for="payBuyFlag">预约时间为实际付款时间：</label><input type="checkbox" id="payBuyFlag"></span>'
					//+'    <span><br/><label for="refBfBuy">购买前自动刷新（本次）：</label><input type="checkbox" id="refBfBuy"></span>'
					+'  </span>'
					+' </div>'
					+' </div>'
					+' <div class="form-group">'
					+' <label for="buyRealname" class="col-sm-3 control-label">购票人关键字</label>'
					+' <div class="col-sm-9">'
					+'   <input type="text" class="form-control" id="buyRealname" placeholder="请输入购票人关键字">'
					+'   <span class="help-block">可以输入姓名，或者身份证号码。万一重复，系统会自动选择第一个。</span>'
					+' </div>'
					+' </div>'
					+' </form>'
					+'</div>',
				btn: ['<span style="font-weight:600">确认一键下单</span>', '取消'],
				success: function(layero, index){
						//$(layero).css('z-index','999999990');//设定这个是为了解决layer界面和淘宝本身的ui的显示层次问题！
						$('.layui-layer-btn').css('font-size','17px');
						$('#bookTimeBuy').val(runtime.nowFormatDT());//默认值
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
						$('#open,#bookTimeBuy,#buyRealname').keydown(function(event){
							if(event.keyCode==13||event.which==13){
								document.getElementsByClassName('layui-layer-btn0')[0].click();
								return false;
							}
						});
						//showSysDT($('#sysDT')[0]);//显示系统日期给用户，方便查看系统时间
					},
				yes: function(index, layero){//同意之后的处理
						var buyRealname,bookTimeBuy;
						buyRealname = $('#buyRealname').val();
						//buyRemark = '';//prompt('请输入给卖家的留言','');//设定给买家的留言是什么//storageMain.setItem('buyRemark',buyRemark);
						bookTimeBuy= $('#bookTimeBuy').val();
						if(!bookTimeBuy||isNaN(new Date(bookTimeBuy).getTime())){
							alert('请输入正确的日期！注意格式是：yyyy-MM-dd hh:mm:ss');
							return false;
						}
						//clearSysDT();
						console.log('-->bookTimeBuy:'+bookTimeBuy+',buyRealname:'+buyRealname);
						yesCallback&&yesCallback(bookTimeBuy,buyRealname);
						layer.close(index);
					},
				btn2: function(index, layero){
						//clearSysDT();
						if(sour=='taobaoBuyPage') $('#detail').css('z-index','99999999');
					}
			});
		 },
		 buyPageShowRemain: function(sour,buyRealname,bookTimeBuyMS,options,buy,page){
			var buyRealnameDesc = buyRealname||'(未定义)'
			,timeOut = bookTimeBuyMS-runtime.now()
			,nextSecGap = timeOut%1000;
			console.log('nextSecGap(与下一秒相隔的毫秒):'+nextSecGap+',timeOut:'+timeOut);
			layer.open({
			  type: 1, //page层
			  area: ['540px', '210px'],
			  title: '<B>大麦下单助手--自动下单倒计时</B>',
			  shade: 0.3, //遮罩透明度
			  moveType: 1, //拖拽风格，0是默认，1是传统拖动
			  shift: 2, //0-6的动画形式，-1不开启
			  skin: 'layui-layer-rim',
			  offset: 'rb',
			  zIndex:999999991,
			  //scrollbar: false,
			  closeBtn: 1,
			  content: '<div style="background:#333333;padding:20px;font-size:12px;">'
					+'<div id="times_container"  style="border:1px; border-color:#999999; background:#333333; color:#FFFFFF; width:500px; height:40px; line-height:40px; font-size:26px">'
					+'离自动下单还有：<span id="times_day"></span>天<span id="times_hour"></span>时<span id="times_minute"></span>分<span id="times_second"></span>秒'
					+'</div>'
					+'</div>'
					+'<div>'
					+'<div style="padding:8px;"><span class="help-block" style="margin-bottom:5px;">'
					+'<B>预约购买时间：  </B>'+new Date(bookTimeBuyMS).formatDT()
					+'<br/><B>购票人：</B>'+buyRealnameDesc
					//+'<br/><B>购物助手设定：</B><b>自动下单:</b>'+options.click_order+'&nbsp;/&nbsp;<b style="color:red;">自动付款:</b>'+options.click_pay
					+'<span id="setByTime"><br/></span>'
					+'<br/>提示：如果要取消预约下单，请关闭此小窗口，或者直接关闭页签。'
					+'</span>'
					+'</div>'
					+'</div>',
			  success: function(layero, index){//启动成功的时候，自动调用的回调函数！
						$(layero).css('z-index','999999999');//$(layero).css('background-color','#eee');
						$('.layui-layer-ico').css('background','url("'+chrome.extension.getURL("include/layer/skin/default/icon.png")+'") no-repeat');
						$('.layui-layer-ico').css('background-position','0 -40px');
						var time_distance=timeOut;//显示倒计时效果
						a.refTime(time_distance);
						setTimeout(
							function(){
								time_distance=time_distance-(1000+nextSecGap);
								var taskId=setInterval(
									function(){
										a.refTime(time_distance);
										time_distance=time_distance-1000;
										if(time_distance<0){clearInterval(taskId);}
									},1000);
							},nextSecGap);
						setTimeout(function(){layer.close(index);},timeOut);
					},
				cancel: function(index){
						layer.close(index);
						buy.stopMonitor();
						page.clearSessionStorage();
						showAlert('提示：本次自动下单已经停止!');
					}
			});
		},
		refTime: function(time_distance){//刷新倒计时界面的时间
			var int_day, int_hour, int_minute, int_second;
			int_day = Math.floor(time_distance/86400000)
			time_distance -= int_day * 86400000;
			int_hour = Math.floor(time_distance/3600000)
			time_distance -= int_hour * 3600000; 
			int_minute = Math.floor(time_distance/60000)   
			time_distance -= int_minute * 60000;
			int_second = Math.floor(time_distance/1000)   
			if(int_hour < 10) int_hour = "0" + int_hour; 
			if(int_minute < 10) int_minute = "0" + int_minute; 
			if(int_second < 10) int_second = "0" + int_second;

			// 显示倒计时效果      
			$('#times_day').html(int_day);
			$('#times_hour').html(int_hour);
			$('#times_minute').html(int_minute);
			$('#times_second').html(int_second);
		},
		showLoading: function(content){
			return layer.open({
			  type: 1,
			  title: false,
			  closeBtn: 0,
			  shadeClose: false,
			  skin: 'layui-layer-rim',
			  zIndex:999999991,
			  shift: 1,
			  content: content,
			  success: function(layero, index){
				  $(layero).css({'background-color':'#81BA25','color':'#fff'});
				  $(layero).find('div.layui-layer-content').css('padding','30px');
			  }
			});
		}
    }
    d.exports = a
});
Date.prototype.format = function (fmt) { //author: meizz 
	var o = {
		"M+": this.getMonth() + 1, //月份 
		"d+": this.getDate(), //日 
		"h+": this.getHours(), //小时 
		"m+": this.getMinutes(), //分 
		"s+": this.getSeconds(), //秒 
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
		"S": this.getMilliseconds() //毫秒 
	};
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
	if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}
Date.prototype.formatMS = function () {
	return this.format("yyyy-MM-dd hh:mm:ss.S");
}
Date.prototype.formatDT = function () {
	return this.format("yyyy-MM-dd hh:mm:ss");
}
window.showMsg=function(msg){
	layer.msg(msg,{time: 8000,zIndex:9999999991})
};
window.showAlert=function(msg,callback){
	layer.open({title:'提示', content:msg, yes: function(index){callback&&callback();layer.close(index);}});
};
window.createEvent=function(eventName, ofsx, ofsy) {
	var evt = document.createEvent('MouseEvents');
	evt.initMouseEvent(eventName , true , false , null , 0 , 0 , 0 , ofsx, ofsy,  false, false , false, false, 0, null);
	return evt;
};
window.randomNumber=function(min, max) {//随机数，包含下限，不包含上限
	var n = Math.floor(Math.random() * (max - min)) + min;
	return n;
};
