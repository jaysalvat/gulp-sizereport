# gulp-sizereport

[![npm version](https://badge.fury.io/js/gulp-sizereport.svg)](http://badge.fury.io/js/gulp-sizereport)

Display a report of the size and Gzipped size of your project and trigger alarms when the sizes are higher than expected.

Inspired by [gulp-size](https://github.com/sindresorhus/gulp-size) by [Sindre Sorhus](http://sindresorhus.com).

![Screenshot](https://raw.githubusercontent.com/jaysalvat/gulp-sizereport/master/screenshot.png)

## Install

```sh
$ npm install --save-dev gulp-sizereport
```

## Usage

```js
var gulp = require('gulp');
var sizereport = require('gulp-sizereport');

gulp.task('sizereport', function () {
	return gulp.src('./dist/*')
		.pipe(sizereport());
});
```

```sh
$ gulp sizereport
```

### Usage with alerts

```js
var gulp = require('gulp');
var sizereport = require('gulp-sizereport');

gulp.task('sizereport', function () {
    return gulp.src('./dist/*')
        .pipe(sizereport({
            '*': {
                'maxSize': 20000,
                'maxGzippedSize': 15000
            },
            'file1.js': {
                'maxSize': 10000
            },
            'file2.js': {
                'maxSize': 10000,
                'maxGzippedSize': 5000
            },
            'maxTotalSize': 20000,
            'maxTotalGzippedSize': 10000
        }));
});
```

```sh
$ gulp sizereport
```