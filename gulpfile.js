var gulp = require('gulp');
var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var minifyInline = require('gulp-minify-inline');
var htmlmin = require('gulp-htmlmin');
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

// Minify stylesheets
gulp.task('minify-css', function () {
	return gulp.src('./src/app.css')
		.pipe(minifyCss({
			compatibility: 'ie8'
		}))
		.pipe(gulp.dest('dist'))
		.pipe(browserSync.stream());
});

// Minify scripts
gulp.task('minify-js', function () {
	return gulp.src('./src/app.js')
		.pipe(uglify())
		.pipe(gulp.dest('dist'));
});

// Minify inline scripts & HTML
gulp.task('minify-html', function () {
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

// Static Server + watching css/html files
gulp.task('serve', ['minify-css', 'minify-js'], function () {
	browserSync.init({
		server: './dist'
	});
	gulp.watch('./src/app.css', ['minify-css']);
	gulp.watch('./src/*.html').on('change', browserSync.reload);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['copy', 'minify-css', 'minify-js', 'minify-html']);