/**
 *
 *  All tasks realted to running the test suite are located in this file
 * 
 */

import karmaConfig from "./karma.config";
import { server as karma } from "karma";

gulp.task("test", done => { 
  tester({singleRun:true}, () => {
    done();
    process.exit(0);
  }); 
});
gulp.task("test-watch", done => { tester({}, done); });


function tester(options, done) {
  let config = karmaConfig(options);
  karma.start(config, (exitCode) => {
    if(exitCode === 0) {
      done();
    } else {
      throw new Error(`test run exited with: ${exitCode}`);
    }
  });
}