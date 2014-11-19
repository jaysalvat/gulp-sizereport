# gulp-sizereport

Display a report of the size and Gzipped size of your project and trigger alarms when the sizes are higher than expected.

Inspired by [gulp-size](https://github.com/sindresorhus/gulp-size) by [Sindre Sorhus](http://sindresorhus.com).


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