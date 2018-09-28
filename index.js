var beeper      = require('beeper'),
    colors      = require('ansi-colors'),
    through     = require('through2'),
    prettyBytes = require('pretty-bytes'),
    gzipSize    = require('gzip-size'),
    PluginError = require('plugin-error');
    Table       = require('cli-table');

module.exports = function (options) {
    "use strict";

    options          = options || {};
    options.gzip     = (options.gzip     !== undefined) ? options.gzip     : false;
    options.minifier = (options.minifier !== undefined) ? options.minifier : null;
    options.total    = (options.total    !== undefined) ? options.total    : true;
    options.fail     = (options.fail     !== undefined) ? options.fail    : false;

    var tableHeadCols = [
        'File',
        'Original'
    ],
    fail = false;

    if (options.gzip) {
        tableHeadCols.push('Gzipped');
    }

    if (options.minifier) {
        tableHeadCols.push('Minified');

        if (options.gzip) {
            tableHeadCols.push('Gzipped');
        }
    }

    var fileCount = 0,
        totalSize = 0,
        totalGzippedSize = 0,
        totalMinifiedSize = 0,
        totalMinifiedGzippedSize = 0,
        gzippedSize,
        minifiedGzippedSize,
        minified,
        table = new Table({
            head:      tableHeadCols,
            //colWidths: [ 30, 12, 12, 12, 12 ],
            colAligns: [ 'left', 'right', 'right', 'right', 'right' ],
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
            beeper();
            fail = true;

            return colors.red(prettyBytes(size));
        }

        return prettyBytes(size);
    };

    return through.obj(function (file, enc, callback) {
        if (file.isNull()) {
            callback(null, file);
            return;
        }

        if (file.isStream()) {
            callback(new PluginError('gulp-sizereport', 'Streaming not supported'));
            return;
        }

        gzippedSize       = gzipSize.sync(file.contents);
        totalSize        += file.contents.length;
        totalGzippedSize += gzippedSize;
        fileCount ++;

        var row = [
            file.relative,
            getSizeToDisplay(file.contents.length, 'maxSize', file.relative)
        ];

        if (options.gzip) {
            row.push(getSizeToDisplay(gzippedSize, 'maxGzippedSize', file.relative));
        }

        if (typeof options.minifier === 'function') {
            minified           = options.minifier('' + file.contents, file.relative);
            totalMinifiedSize += minified.length;

            row.push(getSizeToDisplay(minified.length, 'maxMinifiedSize', file.relative));

            if (options.gzip) {
                minifiedGzippedSize       = gzipSize.sync(minified);
                totalMinifiedGzippedSize += minifiedGzippedSize;
                row.push(getSizeToDisplay(minifiedGzippedSize, 'maxMinifiedGzippedSize', file.relative));
            }
        }
        table.push(row);

        callback(null, file);

    }, function (callback) {

        if (options.title) {
            console.log(':: ' + colors.bold(options.title) + ' ::');
        }

        if (fileCount > 0) {
            if (options.total === true) {
                var row = [
                    '',
                    colors.bold(getSizeToDisplay(totalSize, 'maxTotalSize', '*'))
                ];

                if (options.gzip) {
                    row.push(colors.bold(getSizeToDisplay(totalGzippedSize, 'maxTotalGzippedSize', '*')));
                }

                if (options.minifier) {
                    row.push(colors.bold(getSizeToDisplay(totalMinifiedSize, 'maxTotalMinifiedSize', '*')));

                    if (options.gzip) {
                        row.push(colors.bold(getSizeToDisplay(totalMinifiedGzippedSize, 'maxTotalMinifiedGzippedSize', '*')));
                    }
                }

                table.push(row);
            }

            console.log(table.toString());
            if (options.fail && fail) {
                callback(new PluginError('gulp-sizereport', 'One or more file(s) exceeded the maximum size defined in options.'));
                return;
            }
        }

        callback();
    });
};
