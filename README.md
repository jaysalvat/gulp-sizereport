# gulp-sizereport

[![npm version](https://badge.fury.io/js/gulp-sizereport.svg)](http://badge.fury.io/js/gulp-sizereport)

Display a report of the size and Gzipped size of your project and trigger alarms when the sizes are higher than expected.

![Screenshot](https://raw.githubusercontent.com/jaysalvat/gulp-sizereport/master/screenshot0.png)

## Install

```sh
$ npm install --save-dev gulp-sizereport
```

## Usage

A simple usage

```js
var gulp = require('gulp');
var sizereport = require('gulp-sizereport');

gulp.task('sizereport', function () {
	return gulp.src('./dist/*')
		.pipe(sizereport());
});
```

![Screenshot](https://raw.githubusercontent.com/jaysalvat/gulp-sizereport/master/screenshot1.png)

## Options

- ``title`` (default: null)
Display a title above the table.

- ``total`` (default: true)
Display the last total row.

- ``gzip`` (default: false)
Toggle the Gzipped size column.

- ``fail`` (default: false)
Allows you to fail your Gulp task if a file exceeds a threshold.

```js
var gulp = require('gulp');
var sizereport = require('gulp-sizereport');

gulp.task('sizereport', function () {
    return gulp.src('./dist/*')
        .pipe(sizereport({
            gzip: true
        }));
});
```

![Screenshot](https://raw.githubusercontent.com/jaysalvat/gulp-sizereport/master/screenshot2.png)

- ``minifier`` (default: null)
You can add a minifier in order to control the minified size of your source.

```js
var gulp = require('gulp');
var sizereport = require('gulp-sizereport');
var UglifyJS = require('uglify-js');

gulp.task('sizereport', function () {
    return gulp.src('./src/**/*.js')
        .pipe(sizereport({
            minifier: function (contents, filepath) {
                if (filepath.match(/\.min\./g)) {
                    return contents
                }
                return UglifyJS.minify(contents, { fromString: true }).code;
            }
        }));
});
```

![Screenshot](https://raw.githubusercontent.com/jaysalvat/gulp-sizereport/master/screenshot3.png)

Ideal to control the project size on the fly.

```js
gulp.task('watch', function () {
    gulp.watch('./src/**/*.js', [ 'sizereport'] );
});
```

- ``outputFilename`` (default: null) Specify a filename to output your report to.
- ``outputFileFormat`` (default: text) Specify the format of the output report. Valid values are `text` and `md`.

If the file already exists, the report is appended in order to write multiple reports to one file.

```js
var gulp = require('gulp');
var sizereport = require('gulp-sizereport');

gulp.task('sizereport', function () {
    return gulp.src('./dist/*')
        .pipe(sizereport({
            outputFilename: './dist/sizereport.md',
            outputFileFormat: 'md'
        }));
});
```

## Alerts

You can place some alerts on values and files. The value is in Bytes.

- ``maxSize``
- ``maxGzippedSize``
- ``maxMinifiedSize``
- ``maxMinifiedGzippedSize``
- ``maxTotalSize``
- ``maxTotalGzippedSize``
- ``maxTotalMinifiedSize``
- ``maxTotalMinifiedGzippedSize``

```js
var gulp = require('gulp');
var sizereport = require('gulp-sizereport');
var UglifyJS = require('uglify-js');

gulp.task('sizereport', function () {
    return gulp.src('./dist/*.js')
        .pipe(sizereport({
            gzip: true,
            minifier: function (contents) {
                return UglifyJS.minify(contents, { fromString: true }).code;
            },
            '*': {
                'maxSize': 100000
            },
            'pin.js': {
                'maxMinifiedSize': 5500,
                'maxMinifiedGzippedSize': 2500
            }
        }));
});
```

![Screenshot](https://raw.githubusercontent.com/jaysalvat/gulp-sizereport/master/screenshot4.png)
