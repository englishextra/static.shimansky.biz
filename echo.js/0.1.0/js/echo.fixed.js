/*!
 * modified Echo.js, simple JavaScript image lazy loading
 * added option to specify data attribute and img class
 * @see {@link https://toddmotto.com/echo-js-simple-javascript-image-lazy-loading/}
 * @see {@link https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md#feature-detection}
 * forced passive event listener if supported
 * passes jshint
 */
(function (root, document) {
	"use strict";
	var echo = function (imgClass, dataAttributeName, throttleRate) {
		imgClass = imgClass || "data-src-img";
		dataAttributeName = dataAttributeName || "src";
		throttleRate = throttleRate || 100;
		var addEventListener = "addEventListener";
		var dataset = "dataset";
		var getElementsByClassName = "getElementsByClassName";
		var getBoundingClientRect = "getBoundingClientRect";
		var classList = "classList";
		var getAttribute = "getAttribute";
		var length = "length";
		var documentElement = "documentElement";
		var defineProperty = "defineProperty";
		var Echo = function (elem) {
			var _this = this;
			_this.elem = elem;
			_this.render();
			_this.listen();
		};
		var isBindedEchoClass = "is-binded-echo";
		var isBindedEcho = (function () {
			return document[documentElement][classList].contains(isBindedEchoClass) || "";
		}
			());
		var echoStore = [];
		var scrolledIntoView = function (element) {
			var coords = element[getBoundingClientRect]();
			return ((coords.top >= 0 && coords.left >= 0 && coords.top) <= (root.innerHeight || document[documentElement].clientHeight));
		};
		var echoSrc = function (img, callback) {
			img.src = img[dataset][dataAttributeName] || img[getAttribute]("data-" + dataAttributeName);
			if (callback) {
				callback();
			}
		};
		var removeEcho = function (element, index) {
			if (echoStore.indexOf(element) !== -1) {
				echoStore.splice(index, 1);
			}
		};
		var echoImageAll = function () {
			for (var i = 0; i < echoStore.length; i++) {
				var self = echoStore[i];
				if (scrolledIntoView(self)) {
					echoSrc(self, removeEcho(self, i));
				}
			}
		};
		var throttle = function (func, wait) {
			var ctx,
			args,
			rtn,
			timeoutID;
			var last = 0;
			return function throttled() {
				ctx = this;
				args = arguments;
				var delta = new Date() - last;
				if (!timeoutID) {
					if (delta >= wait) {
						call();
					} else {
						timeoutID = setTimeout(call, wait - delta);
					}
				}
				return rtn;
			};
			function call() {
				timeoutID = 0;
				last = +new Date();
				rtn = func.apply(ctx, args);
				ctx = null;
				args = null;
			}
		};
		var throttleEchoImageAll = throttle(echoImageAll, throttleRate);
		var supportsPassive = (function () {
				var support = false;
				try {
					var opts = Object[defineProperty] && Object[defineProperty]({}, "passive", {
							get: function () {
								support = true;
							}
						});
					root[addEventListener]("test", function () {}, opts);
				} catch (err) {}
				return support;
			}
				());
		Echo.prototype = {
			init: function () {
				echoStore.push(this.elem);
			},
			render: function () {
				echoImageAll();
			},
			listen: function () {
				if (!isBindedEcho) {
					root[addEventListener]("scroll", throttleEchoImageAll, supportsPassive ? {passive: true} : false);
					document[documentElement][classList].add(isBindedEchoClass);
				}
			}
		};
		var lazyImgs = document[getElementsByClassName](imgClass) || "";
		var walkLazyImageAll = function () {
			for (var i = 0; i < lazyImgs[length]; i++) {
				new Echo(lazyImgs[i]).init();
			}
		};
		if (lazyImgs) {
			walkLazyImageAll();
		}
	};
	root.echo = echo;
}
	("undefined" !== typeof window ? window : this, document));
