/*jslint browser: true */

/*jslint node: true */

/*global global, ActiveXObject, define, escape, module, pnotify, Proxy, jQuery, require, self, setImmediate, window */

/*!
 * modified Lazyload images, iframes, widgets
 * with a standalone JavaScript lazyloader - v3.2.2
 * @see {@link https://vvo.github.io/lazyload/}
 * @see {@link https://github.com/englishextra/lazyload}
 * for closure compiler added {} on lines:
 * for(var h,d=0,c=p.length;d<c&&!(h=b.call(this,p[d]));d++){};
 * for(var b=this.length;b--&&this[b]!==c;){};
 * fixed var f = new Error("Cannot find module '" + o + "'");
 * f.code = "MODULE_NOT_FOUND";
 * throw f;
 * fixed b = b.parentNode;
 * while (b) {
 * @see {@link https://github.com/vvo/lazyload/blob/master/build/lazyload.js}
 * passes jshint with suppressing comments
 */

/*jshint bitwise: false */
(function (f) {
	window.lazyload = f();
}(function () {
	var define,
	module,
	exports;
	return (function e(t, n, r) {
		function s(o, u) {
			if (!n[o]) {
				if (!t[o]) {
					var a = typeof require === "function" && require;
					if (!u && a) {
						return a(o, true);
					}
					if (i) {
						return i(o, true);
					}
					var f = new Error("Cannot find module '" + o + "'");
					f.code = "MODULE_NOT_FOUND";
					throw f;
				}
				var l = n[o] = {
					exports: {}
				};
				t[o][0].call(l.exports, function (e) {
					var n = t[o][1][e];
					return s(n ? n : e);
				}, l, l.exports, e, t, n, r);
			}
			return n[o].exports;
		}
		var i = typeof require === "function" && require;
		for (var o = 0; o < r.length; o++) {
			s(r[o]);
		}
		return s;
	})({
		1: [function (require, module, exports) {
				(function (global) {
					function lazyload(opts) {
						opts = merge({
								'offset': 333,
								'src': 'data-src',
								'container': false
							}, opts || {});
						if (typeof opts.src === "string") {
							registerLazyAttr(opts.src);
						}
						var elts = [];
						function show(elt) {
							var src = findRealSrc(elt);
							if (src) {
								elt.src = src;
							}
							elt.setAttribute('data-lzled', true);
							elts[indexOf.call(elts, elt)] = null;
						}
						function findRealSrc(elt) {
							if (typeof opts.src === "function") {
								return opts.src(elt);
							}
							return elt.getAttribute(opts.src);
						}
						function register(elt) {
							elt.onload = null;
							elt.removeAttribute('onload');
							elt.onerror = null;
							elt.removeAttribute('onerror');
							if (indexOf.call(elts, elt) === -1) {
								inViewport(elt, opts, show);
							}
						}
						return register;
					}
					module.exports = lazyload;
					var inViewport = require('in-viewport');
					var lazyAttrs = ['data-src'];
					global.lzld = lazyload();
					function replaceGetAttribute(elementName) {
						var fullname = 'HTML' + elementName + 'Element';
						if (fullname in global === false) {
							return;
						}
						var original = global[fullname].prototype.getAttribute;
						global[fullname].prototype.getAttribute = function (name) {
							if (name === 'src') {
								var realSrc;
								for (var i = 0, max = lazyAttrs.length; i < max; i++) {
									realSrc = original.call(this, lazyAttrs[i]);
									if (realSrc) {
										break;
									}
								}
								return realSrc || original.call(this, name);
							}
							return original.call(this, name);
						};
					}
					replaceGetAttribute('Image');
					replaceGetAttribute('IFrame');
					function registerLazyAttr(attr) {
						if (indexOf.call(lazyAttrs, attr) === -1) {
							lazyAttrs.push(attr);
						}
					}
					function merge(defaults, opts) {
						for (var name in defaults) {
							if (opts[name] === undefined) {
								opts[name] = defaults[name];
							}
						}
						return opts;
					}
					function indexOf(value) {
						for (var i = this.length; i-- && this[i] !== value; ) {}
						return i;
					}
				}).call(this, "undefined" !== typeof window ? window : this);
			}, {
				"in-viewport": 2
			}
		],
		2: [function (require, module, exports) {
				(function (global) {
					function inViewport(elt, params, cb) {
						var opts = {
							container: global.document.body,
							offset: 0
						};
						if (params === undefined || typeof params === "function") {
							cb = params;
							params = {};
						}
						var container = opts.container = params.container || opts.container;
						var offset = opts.offset = params.offset || opts.offset;
						for (var i = 0; i < instances.length; i++) {
							if (instances[i].container === container) {
								return instances[i].isInViewport(elt, offset, cb);
							}
						}
						return instances[instances.push(createInViewport(container)) - 1].isInViewport(elt, offset, cb);
					}
					module.exports = inViewport;
					var instances = [];
					var supportsMutationObserver = typeof global.MutationObserver === "function";
					function addEvent(el, type, fn) {
						if (el.attachEvent) {
							el.attachEvent("on" + type, fn);
						} else {
							el.addEventListener(type, fn, false);
						}
					}
					function debounce(func, wait, immediate) {
						var timeout;
						return function () {
							var context = this,
							args = arguments;
							var callNow = immediate && !timeout;
							clearTimeout(timeout);
							function later() {
								timeout = null;
								if (!immediate) {
									func.apply(context, args);
								}
							}
							timeout = setTimeout(later, wait);
							if (callNow) {
								func.apply(context, args);
							}
						};
					}
					var contains = global.document.documentElement.compareDocumentPosition ? function (a, b) {
						return !!(a.compareDocumentPosition(b) & 16);
					}
					 : global.document.documentElement.contains ? function (a, b) {
						return a !== b && (a.contains ? a.contains(b) : false);
					}
					 : function (a, b) {
						b = b.parentNode;
						while (b) {
							if (b === a) {
								return true;
							}
						}
						return false;
					};
					function createInViewport(container) {
						var watches = createWatches();
						var scrollContainer = container === global.document.body ? global : container;
						function watchInViewport(elt, offset, cb) {
							if (isVisible(elt, offset)) {
								watches.remove(elt);
								cb(elt);
							}
						}
						var debouncedCheck = debounce(watches.checkAll(watchInViewport), 15);
						addEvent(scrollContainer, 'scroll', debouncedCheck);
						if (scrollContainer === global) {
							addEvent(global, 'resize', debouncedCheck);
						}
						if (supportsMutationObserver) {
							observeDOM(watches, container, debouncedCheck);
						}
						setInterval(debouncedCheck, 150);
						function isInViewport(elt, offset, cb) {
							if (!cb) {
								return isVisible(elt, offset);
							}
							var remote = createRemote(elt, offset, cb);
							remote.watch();
							return remote;
						}
						function createRemote(elt, offset, cb) {
							function watch() {
								watches.add(elt, offset, cb);
							}
							function dispose() {
								watches.remove(elt);
							}
							return {
								watch: watch,
								dispose: dispose
							};
						}
						function isVisible(elt, offset) {
							if (!contains(global.document.documentElement, elt) || !contains(global.document.documentElement, container)) {
								return false;
							}
							if (!elt.offsetWidth || !elt.offsetHeight) {
								return false;
							}
							var eltRect = elt.getBoundingClientRect();
							var viewport = {};
							if (container === global.document.body) {
								viewport = {
									top: -offset,
									left: -offset,
									right: global.document.documentElement.clientWidth + offset,
									bottom: global.document.documentElement.clientHeight + offset
								};
							} else {
								var containerRect = container.getBoundingClientRect();
								viewport = {
									top: containerRect.top - offset,
									left: containerRect.left - offset,
									right: containerRect.right + offset,
									bottom: containerRect.bottom + offset
								};
							}
							var visible = (eltRect.right >= viewport.left && eltRect.left <= viewport.right && eltRect.bottom >= viewport.top && eltRect.top <= viewport.bottom);
							return visible;
						}
						return {
							container: container,
							isInViewport: isInViewport
						};
					}
					function createWatches() {
						var watches = [];
						function add(elt, offset, cb) {
							if (!isWatched(elt)) {
								watches.push([elt, offset, cb]);
							}
						}
						function remove(elt) {
							var pos = indexOf(elt);
							if (pos !== -1) {
								watches.splice(pos, 1);
							}
						}
						function indexOf(elt) {
							for (var i = watches.length - 1; i >= 0; i--) {
								if (watches[i][0] === elt) {
									return i;
								}
							}
							return -1;
						}
						function isWatched(elt) {
							return indexOf(elt) !== -1;
						}
						function checkAll(cb) {
							return function () {
								for (var i = watches.length - 1; i >= 0; i--) {
									cb.apply(this, watches[i]);
								}
							};
						}
						return {
							add: add,
							remove: remove,
							isWatched: isWatched,
							checkAll: checkAll
						};
					}
					function observeDOM(watches, container, cb) {
						function watch(mutations) {
							if (mutations.some(knownNodes) === true) {
								setTimeout(cb, 0);
							}
						}
						var observer = new MutationObserver(watch);
						var filter = Array.prototype.filter;
						var concat = Array.prototype.concat;
						observer.observe(container, {
							childList: true,
							subtree: true,
							attributes: true
						});
						function knownNodes(mutation) {
							var nodes = concat.call([], Array.prototype.slice.call(mutation.addedNodes), mutation.target);
							return filter.call(nodes, watches.isWatched).length > 0;
						}
					}
				}).call(this, "object" === typeof window && window || "object" === typeof self && self || "object" === typeof global && global || {});
			}, {}
		]
	}, {}, [1])(1);
}));
/*jshint bitwise: true */
