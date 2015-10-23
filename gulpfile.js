var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var minifyInline = require('gulp-minify-inline');
var fileinclude = require('gulp-file-include');
var browserSync = require('browser-sync').create();

// Everything except HTML files
var filesToMove = [
	'./src/**',
	'!./src/**/*.html'
];

// Copy files
gulp.task('copy', function () {
	gulp.src(filesToMove)
		.pipe(gulp.dest('dist'));
});

// Minify inline scripts & HTML
gulp.task('minify', function () {
	return gulp.src('./src/**/*.html')
		.pipe(fileinclude({
			prefix: '@@',
			basepath: './src/'
		}))
		.pipe(minifyInline())
		.pipe(htmlmin({
			collapseWhitespace: true
		}))
		.pipe(gulp.dest('dist'))
});

// Static server
gulp.task('browser-sync', function () {
	browserSync.init({
		server: {
			baseDir: './src'
		}
	});
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['copy', 'minify']);