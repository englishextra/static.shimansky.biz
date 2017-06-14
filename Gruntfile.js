module.exports = function (grunt) {
	grunt.initConfig({
		jshint: {
			all: [
				"bala/0.1.9/js/bala.fixed.js",
				"bootstrap/3.3.7/js/bootstrap.fixed.js",
				"crel/3.0.0/js/crel.fixed.js",
				"docReady/1.0.0/js/docready.fixed.js",
				"doSlide/1.1.4/js/do-slide.fixed.js",
				"Evento/1.0.0/js/evento.fixed.js",
				"fastclick/1.0.6/js/fastclick.fixed.js",
				"google-code-prettify/0.1/js/prettify.lang-css.fixed.js",
				"infinite-scroll/0.1.0/js/infinite-scroll.fixed.js",
				"isotope/3.0.1/js/isotope.imagesloaded.pkgd.fixed.js",
				"isotope/3.0.1/js/isotope.pkgd.fixed.js",
				"jquery/1.10.2/js/jquery.fixed.js",
				"jquery/2.2.4/js/jquery.fixed.js",
				"jquery/3.1.1/js/jquery.fixed.js",
				"jquery-builder/0.7.0/dist/2.1.1/js/jquery-deprecated-wrap.fixed.js",
				"jqueryui/1.10.4/custom/js/jquery-ui.custom.fixed.js",
				"jqueryui/1.12.1/js/jquery-ui.fixed.js",
				"js-cookie/2.1.3/js/js.cookie.fixed.js",
				"kamil/0.1.1/js/kamil.fixed.js",
				"lazyload/3.2.2/js/lazyload.fixed.js",
				"loadCSS/1.2.0/js/loadCSS.fixed.js",
				"loadJS/0.2.3/js/loadJS.fixed.js",
				"ManUp.js/0.7/js/manup.fixed.js",
				"masonry/4.1.1/js/masonry.imagesloaded.pkgd.fixed.js",
				"masonry/4.1.1/js/masonry.pkgd.fixed.js",
				"packery/2.1.1/js/packery.draggabilly.pkgd.fixed.js",
				"packery/2.1.1/js/packery.imagesloaded.draggabilly.pkgd.fixed.js",
				"packery/2.1.1/js/packery.imagesloaded.pkgd.fixed.js",
				"packery/2.1.1/js/packery.pkgd.fixed.js",
				"parallax/2.1.3/js/parallax.fixed.js",
				"photoswipe/4.1.0/js/photoswipe.photoswipe-ui-default.fixed.js",
				"pnotify/1.3.1/js/pnotify.fixed.js",
				"polyfills/js/polyfills.fixed.js",
				"qrjs2/0.1.2/js/qrjs2.fixed.js",
				"reqwest/2.0.5/js/reqwest.fixed.js",
				"routie/0.3.2/js/routie.fixed.js",
				"shower/1.0.1/js/shower.fixed.js",
				"sw-toolbox/3.6.1/js/companion.fixed.js",
				"sw-toolbox/3.6.1/js/sw-toolbox.fixed.js",
				"t.js/0.1.0/js/t.fixed.js",
				"tablesort/4.0.1/js/tablesort.fixed.js",
				"Tocca.js/2.0.1/js/Tocca.fixed.js",
				"ToProgress/0.1.1/js/ToProgress.fixed.js",
				"zenscroll/3.2.2/js/zenscroll.fixed.js"
			]
		}
	});
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.registerTask("default", "jshint");
};
