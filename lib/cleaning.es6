let del = require('del');

gulp.task('clean', done => {
  del(['.tmp', 'dist'], done);
});