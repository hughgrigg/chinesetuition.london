/*jshint esnext: true */
const gulp        = require('gulp');
const filter      = require('gulp-filter');
const htmlmin     = require('gulp-htmlmin');
const minifyCSS   = require('gulp-minify-css');
const awspublish  = require('gulp-awspublish');
const parallelize = require('concurrent-transform');

gulp.task('publish', function () {
  const htmlFilter = filter(['*.html'], {restore: true});
  const cssFilter  = filter(['*.css'], {restore: true});
  const publisher = awspublish.create({
    params: {Bucket:'chinesetuition.london'}
  });
  const headers = {'Cache-Control':'max-age=315360000, public'};
  gulp.src('./site/**/*.*')
    .pipe(htmlFilter)
    .pipe(htmlmin({
      "removeComments": true,
      "collapseWhitespace": true,
      "collapseBooleanAttributes": true,
      "removeAttributeQuotes": true,
      "removeRedundantAttributes": true,
      "useShortDoctype": true,
      "removeScriptTypeAttributes": true,
      "removeStyleLinkTypeAttributes": true,
      "removeOptionalTags": true
    }))
    .pipe(htmlFilter.restore)
    .pipe(cssFilter)
    .pipe(minifyCSS({
      'advanced': true,
      'aggressiveMerging': true,
      'keepBreaks': true
    }))
    .pipe(cssFilter.restore)
    .pipe(awspublish.gzip())
    .pipe(parallelize(publisher.publish(headers), 10))
    .pipe(publisher.cache())
    .pipe(awspublish.reporter());
});
