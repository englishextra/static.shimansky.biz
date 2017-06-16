/*global ActiveXObject, define, escape, module, pnotify, Proxy, require, self, setImmediate */
/*!
 * modified jQuery PNotify Plugin 1.3.1
 * @see {@link http://sciactive.com/pnotify/}
 * Copyright (c) 2009-2014 Hunter Perrin
 * Triple license under the GPL, LGPL, and MPL:
 * @see {@link http://www.gnu.org/licenses/gpl.html}
 * @see {@link http://www.gnu.org/licenses/lgpl.html}
 * @see {@link http://www.mozilla.org/MPL/MPL-1.1.html}
 * @see {@link https://github.com/sciactive/pnotify/blob/1.3.1/jquery.pnotify.js}
 * passes jshint
 */
(function (factory) {
	"use strict";
	if (typeof define === "function" && define.amd) {
		define(["jquery"], factory);
	} else {
		factory(jQuery);
	}
}
	(function ($) {
		var history_handle_top,
		timer,
		body,
		jwindow = $(window),
		styling = {
			jqueryui: {
				container: "ui-widget ui-widget-content ui-corner-all",
				notice: "ui-state-highlight",
				notice_icon: "ui-icon ui-icon-info",
				info: "",
				info_icon: "ui-icon ui-icon-info",
				success: "ui-state-default",
				success_icon: "ui-icon ui-icon-circle-check",
				error: "ui-state-error",
				error_icon: "ui-icon ui-icon-alert",
				closer: "ui-icon ui-icon-close",
				pin_up: "ui-icon ui-icon-pin-w",
				pin_down: "ui-icon ui-icon-pin-s",
				hi_menu: "ui-state-default ui-corner-bottom",
				hi_btn: "ui-state-default ui-corner-all",
				hi_btnhov: "ui-state-hover",
				hi_hnd: "ui-icon ui-icon-grip-dotted-horizontal"
			},
			bootstrap: {
				container: "alert",
				notice: "",
				notice_icon: "icon-exclamation-sign",
				info: "alert-info",
				info_icon: "icon-info-sign",
				success: "alert-success",
				success_icon: "icon-ok-sign",
				error: "alert-error",
				error_icon: "icon-warning-sign",
				closer: "icon-remove",
				pin_up: "icon-pause",
				pin_down: "icon-play",
				hi_menu: "well",
				hi_btn: "btn",
				hi_btnhov: "",
				hi_hnd: "icon-chevron-down"
			},
			bootstrap3: {
				container: "alert",
				notice: "alert-warning",
				notice_icon: "glyphicon glyphicon-exclamation-sign",
				info: "alert-info",
				info_icon: "glyphicon glyphicon-info-sign",
				success: "alert-success",
				success_icon: "glyphicon glyphicon-ok-sign",
				error: "alert-danger",
				error_icon: "glyphicon glyphicon-warning-sign",
				closer: "glyphicon glyphicon-remove",
				pin_up: "glyphicon glyphicon-pause",
				pin_down: "glyphicon glyphicon-play",
				hi_menu: "well",
				hi_btn: "btn btn-default",
				hi_btnhov: "",
				hi_hnd: "glyphicon glyphicon-chevron-down"
			}
		};
		styling.fontawesome = $.extend({}, styling.bootstrap3);
		styling.fontawesome.notice_icon = "fa fa-exclamation-circle";
		styling.fontawesome.info_icon = "fa fa-info";
		styling.fontawesome.success_icon = "fa fa-check";
		styling.fontawesome.error_icon = "fa fa-warning";
		styling.fontawesome.closer = "fa fa-times";
		styling.fontawesome.pin_up = "fa fa-pause";
		styling.fontawesome.pin_down = "fa fa-play";
		styling.fontawesome.hi_hnd = "fa fa-chevron-down";
		var do_when_ready = function do_when_ready() {
			body = $("body");
			$.pnotify.defaults.stack.context = body;
			jwindow = $(window);
			jwindow.bind('resize', function () {
				if (timer) {
					clearTimeout(timer);
				}
				timer = setTimeout(function () {
						$.pnotify_position_all(true);
					}, 10);
			});
		};
		$.extend({
			pnotify_remove_all: function pnotify_remove_all() {
				var notices_data = jwindow.data("pnotify");
				if (notices_data && notices_data.length) {
					$.each(notices_data, function () {
						if (this.pnotify_remove) {
							this.pnotify_remove();
						}
					});
				}
			},
			pnotify_position_all: function pnotify_position_all(animate) {
				if (timer) {
					clearTimeout(timer);
				}
				timer = null;
				var notices_data = jwindow.data("pnotify");
				if (!notices_data || !notices_data.length) {
					return;
				}
				$.each(notices_data, function () {
					var s = this.opts.stack;
					if (!s) {
						return;
					}
					s.nextpos1 = s.firstpos1;
					s.nextpos2 = s.firstpos2;
					s.addpos2 = 0;
					s.animation = animate;
				});
				$.each(notices_data, function () {
					this.pnotify_position();
				});
			},
			pnotify: function pnotify(options) {
				var animating;
				var opts;
				if ((typeof options === "undefined" ? "undefined" : typeof(options)) !== "object") {
					opts = $.extend({}, $.pnotify.defaults);
					opts.text = options;
				} else {
					opts = $.extend({}, $.pnotify.defaults, options);
				}
				for (var i in opts) {
					if (typeof i === "string" && i.match(/^pnotify_/)) {
						opts[i.replace(/^pnotify_/, "")] = opts[i];
					}
				}
				if (opts.before_init) {
					if (opts.before_init(opts) === false) {
						return null;
					}
				}
				var nonblock_last_elem;
				var nonblock_pass = function nonblock_pass(e, e_name) {
					pnotify.css("display", "none");
					var element_below = document.elementFromPoint(e.clientX, e.clientY);
					pnotify.css("display", "block");
					var jelement_below = $(element_below);
					var cursor_style = jelement_below.css("cursor");
					pnotify.css("cursor", cursor_style !== "auto" ? cursor_style : "default");
					if (!nonblock_last_elem || nonblock_last_elem.get(0) !== element_below) {
						if (nonblock_last_elem) {
							dom_event.call(nonblock_last_elem.get(0), "mouseleave", e.originalEvent);
							dom_event.call(nonblock_last_elem.get(0), "mouseout", e.originalEvent);
						}
						dom_event.call(element_below, "mouseenter", e.originalEvent);
						dom_event.call(element_below, "mouseover", e.originalEvent);
					}
					dom_event.call(element_below, e_name, e.originalEvent);
					nonblock_last_elem = jelement_below;
				};
				var styles;
				if (typeof(opts.styling) === "object") {
					styles = opts.styling;
				} else {
					styles = styling[opts.styling];
				}
				var pnotify = $("<div />", {
						"class": "ui-pnotify " + opts.addclass,
						"css": {
							"display": "none"
						},
						"mouseenter": function mouseenter(e) {
							if (opts.nonblock) {
								e.stopPropagation();
							}
							if (opts.mouse_reset && animating === "out") {
								pnotify.stop(true);
								animating = "in";
								pnotify.css("height", "auto").animate({
									"width": opts.width,
									"opacity": opts.nonblock ? opts.nonblock_opacity : opts.opacity
								}, "fast");
							}
							if (opts.nonblock) {
								pnotify.stop().animate({
									"opacity": opts.nonblock_opacity
								}, "fast");
							}
							if (opts.hide && opts.mouse_reset) {
								pnotify.pnotify_cancel_remove();
							}
							if (opts.sticker && !opts.nonblock) {
								pnotify.sticker.trigger("pnotify_icon").css("visibility", "visible");
							}
							if (opts.closer && !opts.nonblock) {
								pnotify.closer.css("visibility", "visible");
							}
						},
						"mouseleave": function mouseleave(e) {
							if (opts.nonblock) {
								e.stopPropagation();
							}
							nonblock_last_elem = null;
							pnotify.css("cursor", "auto");
							if (opts.nonblock && animating !== "out") {
								pnotify.stop().animate({
									"opacity": opts.opacity
								}, "fast");
							}
							if (opts.hide && opts.mouse_reset) {
								pnotify.pnotify_queue_remove();
							}
							if (opts.sticker_hover) {
								pnotify.sticker.css("visibility", "hidden");
							}
							if (opts.closer_hover) {
								pnotify.closer.css("visibility", "hidden");
							}
							$.pnotify_position_all();
						},
						"mouseover": function mouseover(e) {
							if (opts.nonblock) {
								e.stopPropagation();
							}
						},
						"mouseout": function mouseout(e) {
							if (opts.nonblock) {
								e.stopPropagation();
							}
						},
						"mousemove": function mousemove(e) {
							if (opts.nonblock) {
								e.stopPropagation();
								nonblock_pass(e, "onmousemove");
							}
						},
						"mousedown": function mousedown(e) {
							if (opts.nonblock) {
								e.stopPropagation();
								e.preventDefault();
								nonblock_pass(e, "onmousedown");
							}
						},
						"mouseup": function mouseup(e) {
							if (opts.nonblock) {
								e.stopPropagation();
								e.preventDefault();
								nonblock_pass(e, "onmouseup");
							}
						},
						"click": function click(e) {
							if (opts.nonblock) {
								e.stopPropagation();
								nonblock_pass(e, "onclick");
							}
						},
						"dblclick": function dblclick(e) {
							if (opts.nonblock) {
								e.stopPropagation();
								nonblock_pass(e, "ondblclick");
							}
						}
					});
				pnotify.opts = opts;
				pnotify.container = $("<div />", {
						"class": styles.container + " ui-pnotify-container " + (opts.type === "error" ? styles.error : opts.type === "info" ? styles.info : opts.type === "success" ? styles.success : styles.notice)
					}).appendTo(pnotify);
				if (opts.cornerclass !== "") {
					pnotify.container.removeClass("ui-corner-all").addClass(opts.cornerclass);
				}
				if (opts.shadow) {
					pnotify.container.addClass("ui-pnotify-shadow");
				}
				pnotify.pnotify_version = "1.3.1";
				pnotify.pnotify = function (options) {
					var old_opts = opts;
					if (typeof options === "string") {
						opts.text = options;
					} else {
						opts = $.extend({}, opts, options);
					}
					for (var i in opts) {
						if (typeof i === "string" && i.match(/^pnotify_/)) {
							opts[i.replace(/^pnotify_/, "")] = opts[i];
						}
					}
					pnotify.opts = opts;
					if (opts.cornerclass !== old_opts.cornerclass) {
						pnotify.container.removeClass("ui-corner-all").addClass(opts.cornerclass);
					}
					if (opts.shadow !== old_opts.shadow) {
						if (opts.shadow) {
							pnotify.container.addClass("ui-pnotify-shadow");
						} else {
							pnotify.container.removeClass("ui-pnotify-shadow");
						}
					}
					if (opts.addclass === false) {
						pnotify.removeClass(old_opts.addclass);
					} else if (opts.addclass !== old_opts.addclass) {
						pnotify.removeClass(old_opts.addclass).addClass(opts.addclass);
					}
					if (opts.title === false) {
						pnotify.title_container.slideUp("fast");
					} else if (opts.title !== old_opts.title) {
						if (opts.title_escape) {
							pnotify.title_container.text(opts.title).slideDown(200);
						} else {
							pnotify.title_container.html(opts.title).slideDown(200);
						}
					}
					if (opts.text === false) {
						pnotify.text_container.slideUp("fast");
					} else if (opts.text !== old_opts.text) {
						if (opts.text_escape) {
							pnotify.text_container.text(opts.text).slideDown(200);
						} else {
							pnotify.text_container.html(opts.insert_brs ? String(opts.text).replace(/\n/g, "<br />") : opts.text).slideDown(200);
						}
					}
					pnotify.pnotify_history = opts.history;
					pnotify.pnotify_hide = opts.hide;
					if (opts.type !== old_opts.type) {
						pnotify.container.removeClass(styles.error + " " + styles.notice + " " + styles.success + " " + styles.info).addClass(opts.type === "error" ? styles.error : opts.type === "info" ? styles.info : opts.type === "success" ? styles.success : styles.notice);
					}
					if (opts.icon !== old_opts.icon || opts.icon === true && opts.type !== old_opts.type) {
						pnotify.container.find("div.ui-pnotify-icon").remove();
						if (opts.icon !== false) {
							$("<div />", {
								"class": "ui-pnotify-icon"
							}).append($("<span />", {
									"class": opts.icon === true ? opts.type === "error" ? styles.error_icon : opts.type === "info" ? styles.info_icon : opts.type === "success" ? styles.success_icon : styles.notice_icon : opts.icon
								})).prependTo(pnotify.container);
						}
					}
					if (opts.width !== old_opts.width) {
						pnotify.animate({
							width: opts.width
						});
					}
					if (opts.min_height !== old_opts.min_height) {
						pnotify.container.animate({
							minHeight: opts.min_height
						});
					}
					if (opts.opacity !== old_opts.opacity) {
						pnotify.fadeTo(opts.animate_speed, opts.opacity);
					}
					if (!opts.closer || opts.nonblock) {
						pnotify.closer.css("display", "none");
					} else {
						pnotify.closer.css("display", "block");
					}
					if (!opts.sticker || opts.nonblock) {
						pnotify.sticker.css("display", "none");
					} else {
						pnotify.sticker.css("display", "block");
					}
					pnotify.sticker.trigger("pnotify_icon");
					if (opts.sticker_hover) {
						pnotify.sticker.css("visibility", "hidden");
					} else if (!opts.nonblock) {
						pnotify.sticker.css("visibility", "visible");
					}
					if (opts.closer_hover) {
						pnotify.closer.css("visibility", "hidden");
					} else if (!opts.nonblock) {
						pnotify.closer.css("visibility", "visible");
					}
					if (!opts.hide) {
						pnotify.pnotify_cancel_remove();
					} else if (!old_opts.hide) {
						pnotify.pnotify_queue_remove();
					}
					pnotify.pnotify_queue_position(true);
					return pnotify;
				};
				pnotify.pnotify_position = function (dont_skip_hidden) {
					var s = pnotify.opts.stack;
					if (typeof s.context === "undefined") {
						s.context = body;
					}
					if (!s) {
						return;
					}
					if (typeof s.nextpos1 !== "number") {
						s.nextpos1 = s.firstpos1;
					}
					if (typeof s.nextpos2 !== "number") {
						s.nextpos2 = s.firstpos2;
					}
					if (typeof s.addpos2 !== "number") {
						s.addpos2 = 0;
					}
					var hidden = pnotify.css("display") === "none";
					if (!hidden || dont_skip_hidden) {
						var curpos1,
						curpos2;
						var animate = {};
						var csspos1;
						switch (s.dir1) {
						case "down":
							csspos1 = "top";
							break;
						case "up":
							csspos1 = "bottom";
							break;
						case "left":
							csspos1 = "right";
							break;
						case "right":
							csspos1 = "left";
							break;
						}
						curpos1 = parseInt(pnotify.css(csspos1).replace(/(?:\..*|[^0-9.])/g, ''));
						if (isNaN(curpos1)) {
							curpos1 = 0;
						}
						if (typeof s.firstpos1 === "undefined" && !hidden) {
							s.firstpos1 = curpos1;
							s.nextpos1 = s.firstpos1;
						}
						var csspos2;
						switch (s.dir2) {
						case "down":
							csspos2 = "top";
							break;
						case "up":
							csspos2 = "bottom";
							break;
						case "left":
							csspos2 = "right";
							break;
						case "right":
							csspos2 = "left";
							break;
						}
						curpos2 = parseInt(pnotify.css(csspos2).replace(/(?:\..*|[^0-9.])/g, ''));
						if (isNaN(curpos2)) {
							curpos2 = 0;
						}
						if (typeof s.firstpos2 === "undefined" && !hidden) {
							s.firstpos2 = curpos2;
							s.nextpos2 = s.firstpos2;
						}
						if (s.dir1 === "down" && s.nextpos1 + pnotify.height() > (s.context.is(body) ? jwindow.height() : s.context.prop('scrollHeight')) || s.dir1 === "up" && s.nextpos1 + pnotify.height() > (s.context.is(body) ? jwindow.height() : s.context.prop('scrollHeight')) || s.dir1 === "left" && s.nextpos1 + pnotify.width() > (s.context.is(body) ? jwindow.width() : s.context.prop('scrollWidth')) || s.dir1 === "right" && s.nextpos1 + pnotify.width() > (s.context.is(body) ? jwindow.width() : s.context.prop('scrollWidth'))) {
							s.nextpos1 = s.firstpos1;
							s.nextpos2 += s.addpos2 + (typeof s.spacing2 === "undefined" ? 25 : s.spacing2);
							s.addpos2 = 0;
						}
						if (s.animation && s.nextpos2 < curpos2) {
							switch (s.dir2) {
							case "down":
								animate.top = s.nextpos2 + "px";
								break;
							case "up":
								animate.bottom = s.nextpos2 + "px";
								break;
							case "left":
								animate.right = s.nextpos2 + "px";
								break;
							case "right":
								animate.left = s.nextpos2 + "px";
								break;
							}
						} else {
							if (typeof s.nextpos2 === "number") {
								pnotify.css(csspos2, s.nextpos2 + "px");
							}
						}
						switch (s.dir2) {
						case "down":
						case "up":
							if (pnotify.outerHeight(true) > s.addpos2) {
								s.addpos2 = pnotify.height();
							}
							break;
						case "left":
						case "right":
							if (pnotify.outerWidth(true) > s.addpos2) {
								s.addpos2 = pnotify.width();
							}
							break;
						}
						if (typeof s.nextpos1 === "number") {
							if (s.animation && (curpos1 > s.nextpos1 || animate.top || animate.bottom || animate.right || animate.left)) {
								switch (s.dir1) {
								case "down":
									animate.top = s.nextpos1 + "px";
									break;
								case "up":
									animate.bottom = s.nextpos1 + "px";
									break;
								case "left":
									animate.right = s.nextpos1 + "px";
									break;
								case "right":
									animate.left = s.nextpos1 + "px";
									break;
								}
							} else {pnotify.css(csspos1, s.nextpos1 + "px");}

						}
						if (animate.top || animate.bottom || animate.right || animate.left) {
							pnotify.animate(animate, {
								duration: this.opts.position_animate_speed,
								queue: false
							});
						}
						switch (s.dir1) {
						case "down":
						case "up":
							s.nextpos1 += pnotify.height() + (typeof s.spacing1 === "undefined" ? 25 : s.spacing1);
							break;
						case "left":
						case "right":
							s.nextpos1 += pnotify.width() + (typeof s.spacing1 === "undefined" ? 25 : s.spacing1);
							break;
						}
					}
				};
				pnotify.pnotify_queue_position = function (animate, milliseconds) {
					if (timer) {
						clearTimeout(timer);
					}
					if (!milliseconds) {
						milliseconds = 10;
					}
					timer = setTimeout(function () {
							$.pnotify_position_all(animate);
						}, milliseconds);
				};
				pnotify.pnotify_display = function () {
					notices_data = jwindow.data("pnotify");
					if (notices_data && notices_data.length > opts.maxonscreen) {
						var el;
						if (opts.stack.push !== "top") {
							el = notices_data.slice(0, notices_data.length - opts.maxonscreen);
						} else {
							el = notices_data.slice(opts.maxonscreen, notices_data.length);
						}
						$.each(el, function () {
							if (this.pnotify_remove) {
								this.pnotify_remove();
							}
						});
					}
					if (!pnotify.parent().length) {
						pnotify.appendTo(opts.stack.context ? opts.stack.context : body);
					}
					if (opts.before_open) {
						if (opts.before_open(pnotify) === false) {
							return;
						}
					}
					if (opts.stack.push !== "top") {
						pnotify.pnotify_position(true);
					}
					if (opts.animation === "fade" || opts.animation.effect_in === "fade") {
						pnotify.show().fadeTo(0, 0).hide();
					} else {
						if (opts.opacity !== 1) {
							pnotify.show().fadeTo(0, opts.opacity).hide();
						}
					}
					pnotify.animate_in(function () {
						if (opts.after_open) {
							opts.after_open(pnotify);
						}
						pnotify.pnotify_queue_position(true);
						if (opts.hide) {
							pnotify.pnotify_queue_remove();
						}
					});
				};
				pnotify.pnotify_remove = function (timer_hide) {
					if (pnotify.timer) {
						window.clearTimeout(pnotify.timer);
						pnotify.timer = null;
					}
					if (opts.before_close) {
						if (opts.before_close(pnotify, timer_hide) === false) {
							return;
						}
					}
					pnotify.animate_out(function () {
						if (opts.after_close) {
							if (opts.after_close(pnotify, timer_hide) === false) {
								return;
							}
						}
						pnotify.pnotify_queue_position(true);
						if (opts.remove) {
							pnotify.detach();
						}
						if (!opts.history) {
							var notices_data = jwindow.data("pnotify");
							if (notices_data !== null) {
								var idx = $.inArray(pnotify, notices_data);
								if (idx !== -1) {
									notices_data.splice(idx, 1);
								}
							}
						}
					});
				};
				pnotify.animate_in = function (callback) {
					animating = "in";
					var animation;
					if (typeof opts.animation.effect_in !== "undefined") {
						animation = opts.animation.effect_in;
					} else {
						animation = opts.animation;
					}
					if (animation === "none") {
						pnotify.show();
						callback();
					} else if (animation === "show") {
						pnotify.show(opts.animate_speed, callback);
					} else if (animation === "fade") {
						pnotify.show().fadeTo(opts.animate_speed, opts.opacity, callback);
					} else if (animation === "slide") {
						pnotify.slideDown(opts.animate_speed, callback);
					} else if (typeof animation === "function") {
						animation("in", callback, pnotify);
					} else {
						pnotify.show(animation, typeof(opts.animation.options_in) === "object" ? opts.animation.options_in : {}, opts.animate_speed, callback);
					}
				};
				pnotify.animate_out = function (callback) {
					animating = "out";
					var animation;
					if (typeof opts.animation.effect_out !== "undefined") {
						animation = opts.animation.effect_out;
					} else {
						animation = opts.animation;
					}
					if (animation === "none") {
						pnotify.hide();
						callback();
					} else if (animation === "show") {
						pnotify.hide(opts.animate_speed, callback);
					} else if (animation === "fade") {
						pnotify.fadeOut(opts.animate_speed, callback);
					} else if (animation === "slide") {
						pnotify.slideUp(opts.animate_speed, callback);
					} else if (typeof animation === "function") {
						animation("out", callback, pnotify);
					} else {
						pnotify.hide(animation, typeof(opts.animation.options_out) === "object" ? opts.animation.options_out : {}, opts.animate_speed, callback);
					}
				};
				pnotify.pnotify_cancel_remove = function () {
					if (pnotify.timer) {
						window.clearTimeout(pnotify.timer);
					}
				};
				pnotify.pnotify_queue_remove = function () {
					pnotify.pnotify_cancel_remove();
					pnotify.timer = window.setTimeout(function () {
							pnotify.pnotify_remove(true);
						}, isNaN(opts.delay) ? 0 : opts.delay);
				};
				pnotify.closer = $("<div />", {
						"class": "ui-pnotify-closer",
						"css": {
							"cursor": "pointer",
							"visibility": opts.closer_hover ? "hidden" : "visible"
						},
						"click": function click() {
							pnotify.pnotify_remove(false);
							pnotify.sticker.css("visibility", "hidden");
							pnotify.closer.css("visibility", "hidden");
						}
					}).append($("<span />", {
							"class": styles.closer,
							"title": opts.labels.close
						})).appendTo(pnotify.container);
				if (!opts.closer || opts.nonblock) {
					pnotify.closer.css("display", "none");
				}
				pnotify.sticker = $("<div />", {
						"class": "ui-pnotify-sticker",
						"css": {
							"cursor": "pointer",
							"visibility": opts.sticker_hover ? "hidden" : "visible"
						},
						"click": function click() {
							opts.hide = !opts.hide;
							if (opts.hide) {
								pnotify.pnotify_queue_remove();
							} else {
								pnotify.pnotify_cancel_remove();
							}
							$(this).trigger("pnotify_icon");
						}
					}).bind("pnotify_icon", function () {
						$(this).children().removeClass(styles.pin_up + " " + styles.pin_down).addClass(opts.hide ? styles.pin_up : styles.pin_down);
					}).append($("<span />", {
							"class": styles.pin_up,
							"title": opts.labels.stick
						})).appendTo(pnotify.container);
				if (!opts.sticker || opts.nonblock) {
					pnotify.sticker.css("display", "none");
				}
				if (opts.icon !== false) {
					$("<div />", {
						"class": "ui-pnotify-icon"
					}).append($("<span />", {
							"class": opts.icon === true ? opts.type === "error" ? styles.error_icon : opts.type === "info" ? styles.info_icon : opts.type === "success" ? styles.success_icon : styles.notice_icon : opts.icon
						})).prependTo(pnotify.container);
				}
				pnotify.title_container = $("<h4 />", {
						"class": "ui-pnotify-title"
					}).appendTo(pnotify.container);
				if (opts.title === false) {
					pnotify.title_container.hide();
				} else if (opts.title_escape) {
					pnotify.title_container.text(opts.title);
				} else {
					pnotify.title_container.html(opts.title);
				}
				pnotify.text_container = $("<div />", {
						"class": "ui-pnotify-text"
					}).appendTo(pnotify.container);
				if (opts.text === false) {
					pnotify.text_container.hide();
				} else if (opts.text_escape) {
					pnotify.text_container.text(opts.text);
				} else {
					pnotify.text_container.html(opts.insert_brs ? String(opts.text).replace(/\n/g, "<br />") : opts.text);
				}
				if (typeof opts.width === "string") {
					pnotify.css("width", opts.width);
				}
				if (typeof opts.min_height === "string") {
					pnotify.container.css("min-height", opts.min_height);
				}
				pnotify.pnotify_history = opts.history;
				pnotify.pnotify_hide = opts.hide;
				var notices_data = jwindow.data("pnotify");
				if (notices_data === null || (typeof notices_data === "undefined" ? "undefined" : typeof(notices_data)) !== "object") {
					notices_data = [];
				}
				if (opts.stack.push === "top") {
					notices_data = $.merge([pnotify], notices_data);
				} else {
					notices_data = $.merge(notices_data, [pnotify]);
				}
				jwindow.data("pnotify", notices_data);
				if (opts.stack.push === "top") {
					pnotify.pnotify_queue_position(false, 1);
				}
				if (opts.after_init) {
					opts.after_init(pnotify);
				}
				if (opts.history) {
					var history_menu = jwindow.data("pnotify_history");
					if (typeof history_menu === "undefined") {
						$("body").on("pnotify.history-all", function () {
							$.each(notices_data, function () {
								if (this.pnotify_history) {
									if (this.is(":visible")) {
										if (this.pnotify_hide) {
											this.pnotify_queue_remove();
										}
									} else if (this.pnotify_display) {
										this.pnotify_display();
									}
								}
							});
						}).on("pnotify.history-last", function () {
							var pushTop = $.pnotify.defaults.stack.push === "top";
							var i = pushTop ? 0 : -1;
							var notice;
							do {
								if (i === -1) {
									notice = notices_data.slice(i);
								} else {
									notice = notices_data.slice(i, i + 1);
								}
								if (!notice[0]) {
									return false;
								}
								i = pushTop ? i + 1 : i - 1;
							} while (!notice[0].pnotify_history || notice[0].is(":visible"));
							if (notice[0].pnotify_display) {
								notice[0].pnotify_display();
							}
						});
						history_menu = $("<div />", {
								"class": "ui-pnotify-history-container " + styles.hi_menu,
								"mouseleave": function mouseleave() {
									history_menu.animate({
										top: "-" + history_handle_top + "px"
									}, {
										duration: 100,
										queue: false
									});
								}
							}).append($("<div />", {
									"class": "ui-pnotify-history-header",
									"text": opts.labels.redisplay
								})).append($("<button />", {
									"class": "ui-pnotify-history-all " + styles.hi_btn,
									"text": opts.labels.all,
									"mouseenter": function mouseenter() {
										$(this).addClass(styles.hi_btnhov);
									},
									"mouseleave": function mouseleave() {
										$(this).removeClass(styles.hi_btnhov);
									},
									"click": function click() {
										$(this).trigger("pnotify.history-all");
										return false;
									}
								})).append($("<button />", {
									"class": "ui-pnotify-history-last " + styles.hi_btn,
									"text": opts.labels.last,
									"mouseenter": function mouseenter() {
										$(this).addClass(styles.hi_btnhov);
									},
									"mouseleave": function mouseleave() {
										$(this).removeClass(styles.hi_btnhov);
									},
									"click": function click() {
										$(this).trigger("pnotify.history-last");
										return false;
									}
								})).appendTo(body);
						var handle = $("<span />", {
								"class": "ui-pnotify-history-pulldown " + styles.hi_hnd,
								"mouseenter": function mouseenter() {
									history_menu.animate({
										top: "0"
									}, {
										duration: 100,
										queue: false
									});
								}
							}).appendTo(history_menu);
						history_handle_top = handle.offset().top + 2;
						history_menu.css({
							top: "-" + history_handle_top + "px"
						});
						jwindow.data("pnotify_history", history_menu);
					}
				}
				opts.stack.animation = false;
				if (opts.auto_display) {
					pnotify.pnotify_display();
				}
				return pnotify;
			}
		});
		var re_on = /^on/,
		re_mouse_events = /^(dbl)?click$|^mouse(move|down|up|over|out|enter|leave)$|^contextmenu$/,
		re_ui_events = /^(focus|blur|select|change|reset)$|^key(press|down|up)$/,
		re_html_events = /^(scroll|resize|(un)?load|abort|error)$/;
		var dom_event = function dom_event(e, orig_e) {
			var event_object;
			e = e.toLowerCase();
			if (document.createEvent && this.dispatchEvent) {
				e = e.replace(re_on, '');
				if (e.match(re_mouse_events)) {
					$(this).offset();
					event_object = document.createEvent("MouseEvents");
					event_object.initMouseEvent(e, orig_e.bubbles, orig_e.cancelable, orig_e.view, orig_e.detail, orig_e.screenX, orig_e.screenY, orig_e.clientX, orig_e.clientY, orig_e.ctrlKey, orig_e.altKey, orig_e.shiftKey, orig_e.metaKey, orig_e.button, orig_e.relatedTarget);
				} else if (e.match(re_ui_events)) {
					event_object = document.createEvent("UIEvents");
					event_object.initUIEvent(e, orig_e.bubbles, orig_e.cancelable, orig_e.view, orig_e.detail);
				} else if (e.match(re_html_events)) {
					event_object = document.createEvent("HTMLEvents");
					event_object.initEvent(e, orig_e.bubbles, orig_e.cancelable);
				}
				if (!event_object) {
					return;
				}
				this.dispatchEvent(event_object);
			} else {
				if (!e.match(re_on)) {
					e = "on" + e;
				}
				event_object = document.createEventObject(orig_e);
				this.fireEvent(e, event_object);
			}
		};
		$.pnotify.defaults = {
			title: false,
			title_escape: false,
			text: false,
			text_escape: false,
			styling: "bootstrap",
			addclass: "",
			cornerclass: "",
			nonblock: false,
			nonblock_opacity: 0.2,
			history: true,
			maxonscreen: Infinity,
			auto_display: true,
			width: "300px",
			min_height: "16px",
			type: "notice",
			icon: true,
			animation: "fade",
			animate_speed: "slow",
			position_animate_speed: 500,
			opacity: 1,
			shadow: true,
			closer: true,
			closer_hover: true,
			sticker: true,
			sticker_hover: true,
			hide: true,
			delay: 8000,
			mouse_reset: true,
			remove: true,
			insert_brs: true,
			stack: {
				dir1: "down",
				dir2: "left",
				push: "bottom",
				spacing1: 25,
				spacing2: 25,
				context: $("body")
			},
			labels: {
				redisplay: "Redisplay",
				all: "All",
				last: "Last",
				close: "Close",
				stick: "Stick"
			}
		};
		if (document.body) {
			do_when_ready();
		} else {
			$(do_when_ready);
		}
	}));
