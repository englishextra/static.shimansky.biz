/*!
 * @see {@link https://github.com/yeikos/js.merge/blob/master/merge.js}
 * @see {@link https://github.com/flickr/justified-layout/blob/master/lib/row.js}
 * @see {@link https://github.com/flickr/justified-layout/blob/master/lib/index.js}
 * wrap in IIFE, expose justifiedLayout to root
 */
(function (root) {
	"use strict";
	var merge = (function () {
		var Public = function (clone) {
			return merge(clone === true, false, arguments);
		};
		Public.recursive = function (clone) {
			return merge(clone === true, true, arguments);
		};
		Public.clone = function (input) {
			var output = input,
			type = typeOf(input),
			index,
			size;
			if (type === 'array') {
				output = [];
				size = input.length;
				for (index = 0; index < size; ++index)
					output[index] = Public.clone(input[index]);
			} else if (type === 'object') {
				output = {};
				for (index in input) {
					if (input.hasOwnProperty(index)) {
						output[index] = Public.clone(input[index]);
					}
				}
			}
			return output;
		};
		function merge_recursive(base, extend) {
			if (typeOf(base) !== 'object')
				return extend;
			for (var key in extend) {
				if (typeOf(base[key]) === 'object' && typeOf(extend[key]) === 'object') {
					base[key] = merge_recursive(base[key], extend[key]);
				} else {
					base[key] = extend[key];
				}
			}
			return base;
		}
		function merge(clone, recursive, argv) {
			var result = argv[0],
			size = argv.length;
			if (clone || typeOf(result) !== 'object')
				result = {};
			for (var index = 0; index < size; ++index) {
				var item = argv[index],
				type = typeOf(item);
				if (type !== 'object')
					continue;
				for (var key in item) {
					if (item.hasOwnProperty(key)) {
						if (key === '__proto__')
							continue;
						var sitem = clone ? Public.clone(item[key]) : item[key];
						if (recursive) {
							result[key] = merge_recursive(result[key], sitem);
						} else {
							result[key] = sitem;
						}
					}
				}
			}
			return result;
		}
		function typeOf(input) {
			return ({}).toString.call(input).slice(8, -1).toLowerCase();
		}
		return Public;
	})();
	var Row = function (params) {
		this.top = params.top;
		this.left = params.left;
		this.width = params.width;
		this.spacing = params.spacing;
		this.targetRowHeight = params.targetRowHeight;
		this.targetRowHeightTolerance = params.targetRowHeightTolerance;
		this.minAspectRatio = this.width / params.targetRowHeight * (1 - params.targetRowHeightTolerance);
		this.maxAspectRatio = this.width / params.targetRowHeight * (1 + params.targetRowHeightTolerance);
		this.edgeCaseMinRowHeight = params.edgeCaseMinRowHeight;
		this.edgeCaseMaxRowHeight = params.edgeCaseMaxRowHeight;
		this.widowLayoutStyle = params.widowLayoutStyle;
		this.isBreakoutRow = params.isBreakoutRow;
		this.items = [];
		this.height = 0;
	};
	Row.prototype = {
		addItem: function (itemData) {
			var newItems = this.items.concat(itemData),
			rowWidthWithoutSpacing = this.width - (newItems.length - 1) * this.spacing,
			newAspectRatio = newItems.reduce(function (sum, item) {
					return sum + item.aspectRatio;
				}, 0),
			targetAspectRatio = rowWidthWithoutSpacing / this.targetRowHeight,
			previousRowWidthWithoutSpacing,
			previousAspectRatio,
			previousTargetAspectRatio;
			if (this.isBreakoutRow) {
				if (this.items.length === 0) {
					if (itemData.aspectRatio >= 1) {
						this.items.push(itemData);
						this.completeLayout(rowWidthWithoutSpacing / itemData.aspectRatio, 'justify');
						return true;
					}
				}
			}
			if (newAspectRatio < this.minAspectRatio) {
				this.items.push(merge(itemData));
				return true;
			} else if (newAspectRatio > this.maxAspectRatio) {
				if (this.items.length === 0) {
					this.items.push(merge(itemData));
					this.completeLayout(rowWidthWithoutSpacing / newAspectRatio, 'justify');
					return true;
				}
				previousRowWidthWithoutSpacing = this.width - (this.items.length - 1) * this.spacing;
				previousAspectRatio = this.items.reduce(function (sum, item) {
						return sum + item.aspectRatio;
					}, 0);
				previousTargetAspectRatio = previousRowWidthWithoutSpacing / this.targetRowHeight;
				if (Math.abs(newAspectRatio - targetAspectRatio) > Math.abs(previousAspectRatio - previousTargetAspectRatio)) {
					this.completeLayout(previousRowWidthWithoutSpacing / previousAspectRatio, 'justify');
					return false;
				} else {
					this.items.push(merge(itemData));
					this.completeLayout(rowWidthWithoutSpacing / newAspectRatio, 'justify');
					return true;
				}
			} else {
				this.items.push(merge(itemData));
				this.completeLayout(rowWidthWithoutSpacing / newAspectRatio, 'justify');
				return true;
			}
		},
		isLayoutComplete: function () {
			return this.height > 0;
		},
		completeLayout: function (newHeight, widowLayoutStyle) {
			var itemWidthSum = this.left,
			rowWidthWithoutSpacing = this.width - (this.items.length - 1) * this.spacing,
			clampedToNativeRatio,
			clampedHeight,
			errorWidthPerItem,
			roundedCumulativeErrors,
			singleItemGeometry,
			centerOffset;
			if (typeof widowLayoutStyle === 'undefined' || ['justify', 'center', 'left'].indexOf(widowLayoutStyle) < 0) {
				widowLayoutStyle = 'left';
			}
			clampedHeight = Math.max(this.edgeCaseMinRowHeight, Math.min(newHeight, this.edgeCaseMaxRowHeight));
			if (newHeight !== clampedHeight) {
				this.height = clampedHeight;
				clampedToNativeRatio = (rowWidthWithoutSpacing / clampedHeight) / (rowWidthWithoutSpacing / newHeight);
			} else {
				this.height = newHeight;
				clampedToNativeRatio = 1.0;
			}
			this.items.forEach(function (item) {
				item.top = this.top;
				item.width = item.aspectRatio * this.height * clampedToNativeRatio;
				item.height = this.height;
				item.left = itemWidthSum;
				itemWidthSum += item.width + this.spacing;
			}, this);
			if (widowLayoutStyle === 'justify') {
				itemWidthSum -= (this.spacing + this.left);
				errorWidthPerItem = (itemWidthSum - this.width) / this.items.length;
				roundedCumulativeErrors = this.items.map(function (item, i) {
						return Math.round((i + 1) * errorWidthPerItem);
					});
				if (this.items.length === 1) {
					singleItemGeometry = this.items[0];
					singleItemGeometry.width -= Math.round(errorWidthPerItem);
				} else {
					this.items.forEach(function (item, i) {
						if (i > 0) {
							item.left -= roundedCumulativeErrors[i - 1];
							item.width -= (roundedCumulativeErrors[i] - roundedCumulativeErrors[i - 1]);
						} else {
							item.width -= roundedCumulativeErrors[i];
						}
					});
				}
			} else if (widowLayoutStyle === 'center') {
				centerOffset = (this.width - itemWidthSum) / 2;
				this.items.forEach(function (item) {
					item.left += centerOffset + this.spacing;
				}, this);
			}
		},
		forceComplete: function (fitToWidth, rowHeight) {
			if (typeof rowHeight === 'number') {
				this.completeLayout(rowHeight, this.widowLayoutStyle);
			} else {
				this.completeLayout(this.targetRowHeight, this.widowLayoutStyle);
			}
		},
		getItems: function () {
			return this.items;
		}
	};
	function createNewRow(layoutConfig, layoutData) {
		var isBreakoutRow;
		if (layoutConfig.fullWidthBreakoutRowCadence !== false) {
			if (((layoutData._rows.length + 1) % layoutConfig.fullWidthBreakoutRowCadence) === 0) {
				isBreakoutRow = true;
			}
		}
		return new Row({
			top: layoutData._containerHeight,
			left: layoutConfig.containerPadding.left,
			width: layoutConfig.containerWidth - layoutConfig.containerPadding.left - layoutConfig.containerPadding.right,
			spacing: layoutConfig.boxSpacing.horizontal,
			targetRowHeight: layoutConfig.targetRowHeight,
			targetRowHeightTolerance: layoutConfig.targetRowHeightTolerance,
			edgeCaseMinRowHeight: 0.5 * layoutConfig.targetRowHeight,
			edgeCaseMaxRowHeight: 2 * layoutConfig.targetRowHeight,
			rightToLeft: false,
			isBreakoutRow: isBreakoutRow,
			widowLayoutStyle: layoutConfig.widowLayoutStyle
		});
	}
	function addRow(layoutConfig, layoutData, row) {
		layoutData._rows.push(row);
		layoutData._layoutItems = layoutData._layoutItems.concat(row.getItems());
		layoutData._containerHeight += row.height + layoutConfig.boxSpacing.vertical;
		return row.items;
	}
	function computeLayout(layoutConfig, layoutData, itemLayoutData) {
		var laidOutItems = [],
		itemAdded,
		currentRow,
		nextToLastRowHeight;
		if (layoutConfig.forceAspectRatio) {
			itemLayoutData.forEach(function (itemData) {
				itemData.forcedAspectRatio = true;
				itemData.aspectRatio = layoutConfig.forceAspectRatio;
			});
		}
		itemLayoutData.some(function (itemData, i) {
			if (isNaN(itemData.aspectRatio)) {
				throw new Error("Item " + i + " has an invalid aspect ratio");
			}
			if (!currentRow) {
				currentRow = createNewRow(layoutConfig, layoutData);
			}
			itemAdded = currentRow.addItem(itemData);
			if (currentRow.isLayoutComplete()) {
				laidOutItems = laidOutItems.concat(addRow(layoutConfig, layoutData, currentRow));
				if (layoutData._rows.length >= layoutConfig.maxNumRows) {
					currentRow = null;
					return true;
				}
				currentRow = createNewRow(layoutConfig, layoutData);
				if (!itemAdded) {
					itemAdded = currentRow.addItem(itemData);
					if (currentRow.isLayoutComplete()) {
						laidOutItems = laidOutItems.concat(addRow(layoutConfig, layoutData, currentRow));
						if (layoutData._rows.length >= layoutConfig.maxNumRows) {
							currentRow = null;
							return true;
						}
						currentRow = createNewRow(layoutConfig, layoutData);
					}
				}
			}
		});
		if (currentRow && currentRow.getItems().length && layoutConfig.showWidows) {
			if (layoutData._rows.length) {
				if (layoutData._rows[layoutData._rows.length - 1].isBreakoutRow) {
					nextToLastRowHeight = layoutData._rows[layoutData._rows.length - 1].targetRowHeight;
				} else {
					nextToLastRowHeight = layoutData._rows[layoutData._rows.length - 1].height;
				}
				currentRow.forceComplete(false, nextToLastRowHeight);
			} else {
				currentRow.forceComplete(false);
			}
			laidOutItems = laidOutItems.concat(addRow(layoutConfig, layoutData, currentRow));
			layoutConfig._widowCount = currentRow.getItems().length;
		}
		layoutData._containerHeight = layoutData._containerHeight - layoutConfig.boxSpacing.vertical;
		layoutData._containerHeight = layoutData._containerHeight + layoutConfig.containerPadding.bottom;
		return {
			containerHeight: layoutData._containerHeight,
			widowCount: layoutConfig._widowCount,
			boxes: layoutData._layoutItems
		};
	}
	var justifiedLayout = function (input, config) {
		var layoutConfig = {};
		var layoutData = {};
		var defaults = {
			containerWidth: 1060,
			containerPadding: 10,
			boxSpacing: 10,
			targetRowHeight: 320,
			targetRowHeightTolerance: 0.25,
			maxNumRows: Number.POSITIVE_INFINITY,
			forceAspectRatio: false,
			showWidows: true,
			fullWidthBreakoutRowCadence: false,
			widowLayoutStyle: 'left'
		};
		var containerPadding = {};
		var boxSpacing = {};
		config = config || {};
		layoutConfig = merge(defaults, config);
		containerPadding.top = (!isNaN(parseFloat(layoutConfig.containerPadding.top))) ? layoutConfig.containerPadding.top : layoutConfig.containerPadding;
		containerPadding.right = (!isNaN(parseFloat(layoutConfig.containerPadding.right))) ? layoutConfig.containerPadding.right : layoutConfig.containerPadding;
		containerPadding.bottom = (!isNaN(parseFloat(layoutConfig.containerPadding.bottom))) ? layoutConfig.containerPadding.bottom : layoutConfig.containerPadding;
		containerPadding.left = (!isNaN(parseFloat(layoutConfig.containerPadding.left))) ? layoutConfig.containerPadding.left : layoutConfig.containerPadding;
		boxSpacing.horizontal = (!isNaN(parseFloat(layoutConfig.boxSpacing.horizontal))) ? layoutConfig.boxSpacing.horizontal : layoutConfig.boxSpacing;
		boxSpacing.vertical = (!isNaN(parseFloat(layoutConfig.boxSpacing.vertical))) ? layoutConfig.boxSpacing.vertical : layoutConfig.boxSpacing;
		layoutConfig.containerPadding = containerPadding;
		layoutConfig.boxSpacing = boxSpacing;
		layoutData._layoutItems = [];
		layoutData._awakeItems = [];
		layoutData._inViewportItems = [];
		layoutData._leadingOrphans = [];
		layoutData._trailingOrphans = [];
		layoutData._containerHeight = layoutConfig.containerPadding.top;
		layoutData._rows = [];
		layoutData._orphans = [];
		layoutConfig._widowCount = 0;
		return computeLayout(layoutConfig, layoutData, input.map(function (item) {
				if (item.width && item.height) {
					return {
						aspectRatio: item.width / item.height
					};
				} else {
					return {
						aspectRatio: item
					};
				}
			}));
	};
	root.justifiedLayout = justifiedLayout;
})("undefined" !== typeof window ? window : this);
