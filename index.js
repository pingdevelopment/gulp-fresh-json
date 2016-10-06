/**
 *  @author   Fernando Salazar <fernando@blufish.com>
 *  @author   James Gov <james@blufish.com>
 *  @since    Tuesday, September 09, 2016
 */

"use strict";

var through = require('through2'),
	concat  = require('concat-stream'),
	gUtil   = require('gulp-util'),
	fs      = require('fs'),
	extend  = require('extend'),
	clone   = require('clone');

module.exports = function(page) {

	/**
	 *  @param    object file, string encoding, function cb
	 *  @return   void
	 */
	function fresh(file, encoding, cb) {
		switch(true) {

			/**
			 *  Pass along null file.
			 */
			case file.isNull():
				cb(null, file);
				break;

			/**
			 *  @todo   support stream
			 */
			case file.isStream():
				file.contents.pipe(concat(function(data) {
					try {
						file.contents = new Buffer(_parse(String(file.contents)));

						cb(null, file);
					} catch(e) {
						cb(new gUtil.PluginError('gulp-fresh', e.message));
					}
				}));
				break;

			/**
			 *  Process file
			 */
			case file.isBuffer():

				try {
					file.contents = new Buffer(_parse(String(file.contents)));

					cb(null, file);
				} catch (e) {
					cb(new gUtil.PluginError('gulp-fresh', e.message));
				}

				break;
		}

	}

	/**
	 *  @param    string content, function handle
	 *  @return   string
	 */
	function _parse(content) {
		var config = JSON.parse(content),
			output = {},
			abstract = {};

		/**
		 *  Loop through top level properites
		 */
		Object.keys(config).forEach(function(key){
			if(key !== 'pages')
				abstract[key] = config[key];
		});

		/**
		 *  Loop through pages
		 */
		Object.keys(config.pages).forEach(function(key) {
			var holder = clone(abstract);

			extend(true, holder, config.pages[key]);

			if(typeof config.pages[key].scripts != 'undefined') {
				var temp = [],
					i;

				for(i = 0; i < abstract.scripts.length; i++) {
					temp.push(abstract.scripts[i]);
				}

				for(i = 0; i< config.pages[key].scripts.length; i++) {
					temp.push(config.pages[key].scripts[i]);
				}

				holder['scripts'] = temp;
			}

			output[key] = holder;
		});

		if(typeof page !== 'undefined'){
			var o = {};
			o[page] = output[page];
			return JSON.stringify(o);
		} else {
			return JSON.stringify(output);
		}
	}

	return through.obj(fresh);
}
