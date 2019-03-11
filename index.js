var beeper      = require('beeper'),
    colors      = require('ansi-colors'),
    through     = require('through2'),
    prettyBytes = require('pretty-bytes'),
    gzipSize    = require('gzip-size'),
    PluginError = require('plugin-error'),
    Table       = require('cli-table'),
    fs          = require('fs'),
    stripAnsi   = require('strip-ansi');

module.exports = function (options) {
    "use strict";

    options          = options || {};
    options.gzip     = (options.gzip     !== undefined) ? options.gzip     : false;
    options.minifier = (options.minifier !== undefined) ? options.minifier : null;
    options.total    = (options.total    !== undefined) ? options.total    : true;
    options.fail     = (options.fail     !== undefined) ? options.fail     : false;
    options.outputFilename = (options.outputFilename !== undefined) ? options.outputFilename : null;
    options.outputFileFormat = (options.outputFileFormat !== undefined) ? options.outputFileFormat.toLowerCase() : 'text';

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
            var title = ':: ' + colors.bold(options.title) + ' ::';
            console.log(title);

            if (options.outputFilename) {
                if (options.outputFileFormat === 'md') {
                    title = '## ' + options.title;
                }

                fs.writeFile(options.outputFilename, stripAnsi(title.toString()) + "\n", { flag: 'a'}, function(err) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
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
            if (options.outputFilename) {

                var tableToWrite = table;

                if (options.outputFileFormat === 'md') {
                    var mdTable = new Table({
                        head: tableHeadCols,
                        chars: {
                            'top-left': '', 'top': '', 'top-mid': '', 'top-right': '',
                            'left-mid': '', 'mid': '', 'mid-mid': '', 'right-mid': '',
                            'bottom-left': '', 'bottom': '', 'bottom-mid': '', 'bottom-right': '',
                            'left': '|', 'middle': '|', 'right': '|'
                        }
                    });

                    var sepRow = [].concat(tableHeadCols);
                    sepRow[0] = ':---';
                    sepRow.fill('---:', 1);

                    mdTable.push(sepRow);

                    table.slice(0).forEach(function(row) {
                        if (row[0] === '') {
                            for (var i = 1; i < row.length; i++) {
                                row[i] = '**' + row[i] + '**';
                            }
                        }
                        mdTable.push(row);
                    });

                    tableToWrite = mdTable;
                }

                fs.writeFile(options.outputFilename, stripAnsi(tableToWrite.toString()) + "\n\n", { flag: 'a'}, function(err) {
                    if (err) {
                        console.log(err);
                    }
                });
            }

            if (options.fail && fail) {
                callback(new PluginError('gulp-sizereport', 'One or more file(s) exceeded the maximum size defined in options.'));
                return;
            }
        }

        callback();
    });
};
