(function(global, factory){
	// if(!window.jQuery) throw 'Is not jQuery!';
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
        (global.DatePicker = factory())
}(this, function(){
	var device = navigator.platform + '---' + navigator.userAgent,
    	lDev = device.toLowerCase(),
        mReg = lDev.match(/(iphone|ipod|ipad|android|ios|windows phone)/i);
	var Datepicker = function(opts){
		if(!opts) opts = {};
		this.xs = opts.xs || 0.15;	//滚动速率
		this.ty = opts.ty || 32;	//option高度(px)
		this.len = opts.len || 5;	//option.length
		this.lenFloor2 = Math.floor(this.len/2);
		this.bh = this.len*this.ty;
		this.values = [];	//值集
		this.createDom();
	}

	function createElement(name, className, id, attrs){
		var el = document.createElement(name);

		if(id) el.id = id;
		if(className) el.className = className;

		if(attrs){
			for(var d in attrs){
				el.setAttribute(d, attrs[d]);
			}
		}

		return el;
	}

	function getIndexInValue(ul, v){
		var idx = -1;

		for (var i = 0; i < ul.children.length; i++) {
			if(ul.children[i].dataset.value == v) {
				idx = i;
				break;
			}
		}

		return idx;
	}

	Datepicker.prototype = {
		constructor: Datepicker,
		//创建主Dom
		createDom: function(){
			this.eWrap = createElement('div', 'datepicker-wrap', 'jiuy_datepicker_wrap');
			this.eBody = createElement('div', 'datepicker-body');
			this.eCtrs = createElement('div', 'datepicker-ctr');
			this.eSlcs = createElement('div', 'datepicker-slcs');
			this.eTouchs = createElement('div', 'datepicker-touchs');

			this.eCtrsCancel = createElement('span', 'datepicker-ctr-cancel');	//取消
			this.eCtrsCancel.innerText = '取消';
			this.eCtrsAffirm = createElement('span', 'datepicker-ctr-Affirm');	//确认
			this.eCtrsAffirm.innerText = '确认';

			this.eCtrs.appendChild(this.eCtrsCancel);
			this.eCtrs.appendChild(this.eCtrsAffirm);
			this.eBody.appendChild(this.eCtrs);
			this.eBody.appendChild(this.eSlcs);
			this.eBody.appendChild(this.eTouchs);
			this.eWrap.appendChild(this.eBody);

			this.bindEvent();
		},

		addSlcDom: function(idx, options){
			if(!this['eSlcUl_'+idx]) {
				this['eSlcUl_'+idx] = createElement('ul', 'datepicker-slcs-ul');
				this.eSlcs.appendChild(this['eSlcUl_'+idx]);
				var touch = createElement('ul', 'datepicker-touchs-touch');
				for (var i = 0; i < this.len; i++) {
					var tLi = createElement('li', 'datepicker-touchs-touch-'+i);
					tLi.dataset.idx = -i+this.lenFloor2;
					touch.appendChild(tLi);
				}
				this.eTouchs.appendChild(touch);
				this.bindScrollEvent(touch, 'eSlcUl_'+idx, idx);
			}
			
			this['eSlcUl_'+idx].innerHTML = '';

			for (var i = 0; i < options.length; i++) {
				var li = createElement('li', 'datepicker-slcs-li', null, {'data-value': options[i].v});
					li.innerText = options[i].t;

				this['eSlcUl_'+idx].appendChild(li);
			}

			return this['eSlcUl_'+idx];
		},

		//滚动事件绑定
		bindScrollEvent: function(ele, eleName, idx){
			var isScroll = false;
			var self = this;
			var y = 0,
				sy = 0,
				my = 0,
				mt = new Date(),
				ty = this.ty;

			ele.addEventListener(mReg?'touchstart':'mousedown', function(e){
				e.preventDefault();
				mt = new Date();
				isScroll = true;
				if(self[eleName].dataset.inset) {
					sy = parseInt(self[eleName].style.transform.replace(/translate3d|\(|\)|\s|px/g,'').split(',')[1]);
					self[eleName].dataset.inset = null;
				}
				var tp = e.changedTouches;
				my = y = tp ? tp[0].clientY : e.clientY;
			}, true);

			(mReg?ele:document).addEventListener(mReg?'touchmove':'mousemove', function(e){
				e.preventDefault();
				var tp = e.changedTouches;
				if(!isScroll || (tp && !tp.length)) return;
				var _y = (tp ? tp[0].clientY : e.clientY) - y;

				y = tp ? tp[0].clientY : e.clientY;

				if(sy + _y < -self[eleName].scrollHeight || sy + _y > 0) return;

				if(new Date() - mt > 280) {
					my = tp ? tp[0].clientY : e.clientY;
					mt = new Date();
				};
				
				sy += _y;
				// transition: all 0.3s ease-out 0s; transform: translate3d(0px, -160px, 0px);
				self[eleName].style.transition = 'transform 0s ease-out 0s';
				self[eleName].style.transform = 'translate3d(0px, '+sy+'px, 0px)';
			}, true);

			ele.addEventListener(mReg?'touchend':'mouseup', function(e){ 
				e.preventDefault();
				isScroll = false;
				var tp = e.changedTouches;

				if(tp && !tp.length) return;

				var _my = (tp ? tp[0].clientY : e.clientY) - my,
					_mt = new Date() - mt;

				if(_my == 0 && _mt < 280){
					sy += e.target.dataset.idx * ty;
					_mt = 280;
				}else{
					sy += _my / _mt * 100;
				}

				if(sy < -self[eleName].scrollHeight + ty/2){
					sy = -self[eleName].scrollHeight + ty/2;
				}else if(sy > 0){
					sy = 0;
				}

				var sm = sy%ty;
					sy = sm > ty/2 ? sy + ty - sm : sy - sm;

				if(_mt > 280) _mt = sm ? 280 : 0;

				var t = _mt/1000 + Math.abs(_my/1000) + self.xs;

				self[eleName].style.transition = 'transform '+t+'s ease-out 0s';
				self[eleName].style.transform = 'translate3d(0px, '+sy+'px, 0px)';

				var n = -Math.round(sy/ty);

				self.values[idx] = self[eleName].children[n].dataset.value;

				if(self[eleName+'_event']) self[eleName+'_event'](e, self[eleName].children[n].dataset.value);
			}, true);

			if(mReg){
				document.addEventListener('mouseup.'+eleName, function(e){
					e.preventDefault();
					isScroll = false;
				});
			}
		},

		//绑定事件
		bindEvent: function(){
			var self = this;
			self.eCtrsCancel.addEventListener('click', function(e){
				self.hide();
			});

			self.eCtrsAffirm.addEventListener('click', function(e){
				self.hide();
				self.result && self.result(self.values);
			});

			self.eBody.addEventListener('click', function(e){
				e.preventDefault();
			});

			self.eWrap.addEventListener('click', function(e){
				e.target == this && self.hide();
			});
		},

		creatNumOption: function(min, max, unit){
			var opt = [];
			min = parseInt(min);
			max = parseInt(max);
			for (var i = min; i < max; i++) {
				opt.push({t:i+(unit||''), v:i});
			}
			return opt;
		},

		//创建Date选择
		creatDate: function(opts){
			if(!opts) opts = {};
			var _opts = {
				minAr:(opts.min||'2010-02-09').split(/\/|-/).map(function(nb){ return parseInt(nb); }),
				maxAr:(opts.max||'2020-06-15').split(/\/|-/).map(function(nb){ return parseInt(nb); }),
				initAr:opts.init ? opts.init.split(/\/|-/).map(function(nb){ return parseInt(nb); }) : null
			}

			if(!_opts.initAr) {
				_opts.initAr = [
					_opts.minAr[0]+Math.floor((_opts.maxAr[0]-_opts.minAr[0])/2),
					_opts.minAr[1]+Math.floor((_opts.maxAr[1]-_opts.minAr[1])/2),
					_opts.minAr[2]+Math.floor((_opts.maxAr[2]-_opts.minAr[2])/2)
				]
			}

			this.dateOpts = _opts;
			var initDom = this.addSlcDom(0, this.creatNumOption(_opts.minAr[0], _opts.maxAr[0]+1, '年'));

			this.bindDateEvent();

			for (var i = 0; i < _opts.initAr.length; i++) {
				if(!initDom.children || !initDom.children.length) continue;

				var idx = getIndexInValue(initDom, _opts.initAr[i]);

				if(idx < 0) idx = 0;

				this.values[i] = initDom.children[idx].dataset.value;

				initDom.style.transform = 'translate3d(0px, '+(-idx*this.ty)+'px, 0px)';
				initDom.dataset.inset = true;
				initDom = this['eSlcUl_'+i+'_event'](null, initDom.children[idx].dataset.value);
			}

			return this;
		},

		//日期选择事件
		bindDateEvent: function(){
			var self = this;
			self.eSlcUl_0_event = function(e, v){
				var min = 1,
					max = 12;

				self.dateOpts.year = v;

				if(v == self.dateOpts.minAr[0]) {
					min = self.dateOpts.minAr[1]
				}
				else if(v == self.dateOpts.maxAr[0]){
					max = self.dateOpts.maxAr[1]
				}

				var monthsDom = self.addSlcDom(1, self.creatNumOption(min, max+1, '月'));

				resizeSlcUl(monthsDom, self.dateOpts.month || 1, 1);

				return monthsDom;
			}

			self.eSlcUl_1_event = function(e, v){
				var min = 1,
					max = new Date(self.dateOpts.year,parseInt(v),0).getDate();

				self.dateOpts.month = v;

				if(self.dateOpts.year == self.dateOpts.minAr[0] && v == self.dateOpts.minAr[1]) {
					min = self.dateOpts.minAr[2];
				}

				if(self.dateOpts.year == self.dateOpts.maxAr[0] && v == self.dateOpts.maxAr[1]){
					max = self.dateOpts.maxAr[2];
				}

				var daysDom = self.addSlcDom(2, self.creatNumOption(min, max+1, '日'));

				resizeSlcUl(daysDom, self.dateOpts.day || 1, 2);

				return daysDom;
			}

			self.eSlcUl_2_event = function(e, v){
				self.dateOpts.day = v;

				return self['eSlcUl_2'];
			}

			function resizeSlcUl(dom, v, n){
				var idx = getIndexInValue(dom, v),
					isNotNode = idx < 0;

				if(isNotNode){
					var maxv = dom.children[dom.children.length-1].dataset.value,
						isMax = v - maxv > 0;

					v = isMax ? maxv : dom.children[0].dataset.value;
					idx = isMax ? dom.children.length-1 : 0;
				}

				var _sy = parseInt(dom.style.transform.replace(/translate3d|\(|\)|\s|px/g,'').split(',')[1]),
					_tsy = -idx*self.ty,
					t = Math.abs(_sy - _tsy) / 400;

				// dom.style.transition = 'transform '+(t>0.2?t:0.2)+'s ease-out 0s';
				dom.style.transition = 'transform 0s ease-out 0s';
				dom.style.transform = 'translate3d(0px, '+(-idx*self.ty)+'px, 0px)';
				self.values[n] = dom.children[idx].dataset.value;

				self['eSlcUl_'+n+'_event'](null, v);
			}
		},

		bind: function(opts){
			var self = this;

			opts.ele.addEventListener('click', function(e){
				self.target = this;
				if(this.value) opts.init = this.value;
				if(opts.type == 'date'){
					self.creatDate(opts).show();
				}
			});

			return opts;
		},

		show:function(){
			document.querySelector('body').appendChild(this.eWrap);

			setTimeout(function(){
				this.eWrap.classList.add('show');
			}.bind(this),0);

			return this;
		},

		hide:function(){
			this.eWrap.classList.remove('show');

			setTimeout(function(){
				document.querySelector('body').removeChild(this.eWrap);
			}.bind(this),280)
			
			return this;
		}
	}

	return Datepicker;
}))