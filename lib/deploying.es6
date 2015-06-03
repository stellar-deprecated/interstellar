let {join}      = require('path');
let runSequence = require('run-sequence');

gulp.task("deploy", done => { 
  runSequence("clean", "build", "deploy:without-build", done);
});

gulp.task("deploy:without-build", () => { 
  return gulp.src(`dist/${cli.app}/**/*`)
    .pipe($.rename(path => {
      path.dirname = join(cli.app, path.dirname);
    }))
    .pipe($.s3({
      "key":    cli.awsKey,
      "secret": cli.awsSecret,
      "bucket": cli.awsBucket,
      "region": "us-east-1"
    }));
});