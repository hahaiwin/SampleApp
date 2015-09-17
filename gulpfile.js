var gulp = require('gulp'),
    minifyCss = require('gulp-minify-css'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint');

// css 压缩
gulp.task('minify-css', function() {
    return gulp.src('public/src/stylesheets/*.css')
        .pipe(minifyCss())
        .pipe(gulp.dest('public/build/stylesheets/'));
});
// css 检测
gulp.task('lint', function() {
    return gulp.src('public/src/javascripts/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});
// 合并，压缩文件
gulp.task('scripts', function() {
    gulp.src('public/src/javascripts/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('public/build/javascripts/'));
});
gulp.task('default', function() {
  gulp.run('minify-css', 'lint', 'scripts');
});