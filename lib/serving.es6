/**
 * 
 * This task file is the home for all of the tasks related to
 * starting an http server (usually for the purpose of development)
 * 
 */

let connect           = require('connect');
let connectLiveReload = require('connect-livereload');
let serveStatic       = require('serve-static');
let runSequence       = require('run-sequence');
let {Gaze}            = require('gaze');

gulp.task("serve", done => { 
  //note: we don't call done.  "serving" tasks never complete

  runSequence("build", "start-serve");
});

gulp.task("serve-watch", done => { 
  //note: we don't call done.  "serving" tasks never complete

  runSequence("build-watch", "start-serve", () => {
    $.livereload.listen({port: cli.port + 1});
    let gaze = new Gaze('.tmp/webpacked/BUILT_AT');

    gaze.on('all', (fp) => {
      $.livereload.changed('.tmp/webpacked/index.html');
    });

  });
});

gulp.task("start-serve", done => {
  let app = connect()
    .use(connectLiveReload({ port: cli.port + 1 }))
    .use(serveStatic('.tmp/webpacked'))
    ;

  require('http').createServer(app)
      .listen(cli.port)
      .on('listening', function () {
          console.log(`Started connect web server on http://localhost:${cli.port}`);
          require('opn')(`http://localhost:${cli.port}`);
          done();
      });
});

gulp.task("serve-atom", ['build-atom'], done => { 
  require('opn')(`./dist/atom/${cli.app}/${cli.app}.app`);
});