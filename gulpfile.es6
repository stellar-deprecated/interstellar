global.gulp   = require("gulp");
global.$      = require("gulp-load-plugins")();
global.__root = __dirname;
global.cli    = require("./lib/cli");
require('colors');
import { createReadStream } from 'fs';

gulp.task("stroopy", () => createReadStream(`${__dirname}/stroopy.txt`).pipe(process.stdout));

require("./lib/building");
require("./lib/generating");
require("./lib/cleaning");
require("./lib/serving");
require("./lib/deploying");

gulp.task("default", ["test"]);
gulp.task("develop", ["serve-watch"]);
