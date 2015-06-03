/**
 * Wrapper around yeoman
 */

gulp.task("generate", () => {
  var spawn = require('child_process').spawn;
  var child = spawn(__dirname+'/../node_modules/yo/lib/cli.js', {stdio: 'inherit'});
});