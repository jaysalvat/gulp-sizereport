var gutil   	= require('gulp-util'),
	through 	= require('through2'),
	chalk    	= require('chalk'),
	prettyBytes = require('pretty-bytes'),
	gzippedSize = require('gzip-size'),
	Table 		= require('cli-table');

module.exports = function (options) {
	"use strict";

	options = options || {};

	var fileCount = 0,
		totalSize = 0,
		totalGzippedSize = 0,
		table = new Table({
		    head: 	   [ 'File', 'Size', 'Gzipped size' ],
		    colWidths: [ 30, 15, 15 ],
		    colAligns: [ 'left', 'right', 'right' ],
		    style: {
		    	head:  [ 'cyan' ]
		    }
		});

	var getSizeToDisplay = function (size, key, filename) {
		var max = options[filename] || options['*'],
			value;

		if (max) {
			value = max[key];
		} else {
			value = options[key];
		}

		if (value && size > value) {
			gutil.beep();

			return chalk.red(prettyBytes(size));
		}

		return prettyBytes(size);
	};

	return through.obj(function (file, enc, callback) {
		if (file.isNull()) {
			callback(null, file);
			return;
		}

		if (file.isStream()) {
			callback(new gutil.PluginError('gulp-size', 'Streaming not supported'));
			return;
		}

		var finish = function (err, gzippedSize) {
			totalSize        += file.contents.length;
			totalGzippedSize += gzippedSize;
			fileCount ++;

			table.push([ 
				file.relative, 
				getSizeToDisplay(file.contents.length, 'maxSize', file.relative), 
				getSizeToDisplay(gzippedSize, 'maxGzippedSize', file.relative)
			]);

			callback(null, file);
		};

		gzippedSize(file.contents, finish);

	}, function (callback) {
		if (fileCount > 0) {
			table.push([
			   '', 
	           chalk.bold(getSizeToDisplay(totalSize, 'maxTotalSize', '*')),
	           chalk.bold(getSizeToDisplay(totalGzippedSize, 'maxTotalGzippedSize', '*'))
			]);

			console.log(table.toString());
		}

		callback();
	});
};
