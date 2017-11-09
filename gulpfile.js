var gulp = require('gulp');

var browserSync = require('browser-sync').create();
var reload = browserSync.reload;


gulp.task('css', function() {
  gulp.src('**/*.css')
    .pipe(browserSync.stream());
});


gulp.task('serve', function() {
  browserSync.init({
    server: {
      baseDir: './',
      directory: true,
    },
  });

  gulp.watch('**/*.css', ['css']);
  gulp.watch('**/*.{html,jpg,js}', reload);
});


gulp.task('default', ['serve']);
