var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var pkg = require('./package.json');
var jshint = require('gulp-jshint');

// Set the banner content
var banner = ['/*!\n',
    ' * AnyData - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.repository.url %>)\n',
    ' * Copyright 2016-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n',
    ' */\n',
    ''
].join('');

// Compile LESS files from /less into /css
// Minify compiled CSS
gulp.task('minify-css', function() {
    return gulp.src(['public/stylesheets/*.css', '!public/stylesheets/*.min.css'])
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('public/stylesheets'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify JS
gulp.task('minify-js', function() {
    return gulp.src(['public/scripts/*.js', '!public/scripts/*.min.js'])
        .pipe(uglify())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('public/scripts'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Run everything
gulp.task('default', ['minify-css', 'minify-js']);

// Configure the browserSync task
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: ''
        },
    })
})

// Dev task with browserSync
gulp.task('dev', ['browserSync', 'minify-css', 'minify-js'], function() {
    gulp.watch('public/stylesheets/*.css', ['minify-css']);
    gulp.watch('public/scripts/*.js', ['minify-js']);
    // Reloads the browser whenever HTML or JS files change
    gulp.watch('*.ejs', browserSync.reload);
    gulp.watch('public/scripts/**/*.js', browserSync.reload);
    gulp.watch('routes/**/*.js', browserSync.reload);
});

gulp.task('compile', function () {
    return gulp.src(['controllers/*.js', 'helpers/*.js'])
        .pipe(jshint({
            "asi" : true
        }))
        .pipe(jshint.reporter('jshint-stylish'));
});
