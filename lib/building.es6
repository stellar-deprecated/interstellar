/**
 *
 * All the tasks involved with building our project go here, including:
 *
 * Webpacking, applying content-hashes to files, copying content into build
 * directories
 *
 */


import webpackConfig from "./webpack.config";
import webpack from "webpack";
import runSequence from "run-sequence";
import fs from "fs";
import crypto from "crypto";
import reworkImport from "rework-import";
import path from 'path';
import del from 'del';

let CLI = require('clui'),
    Spinner = CLI.Spinner;

let compiler, spinner;

gulp.task("build", ['clean', 'build:make-compiler'], done => {
  runSequence(
    ['build:webpack'],
    //'build:content-hash',
    // // Turn it off temporarily - was taking too much time
    // 'build:copy-to-dist',
    done);
});

gulp.task("build-watch", ['clean', 'build:make-compiler'], done => {
  let firstDone = false;
  compiler.purgeInputFileSystem();
  compiler.watch(200, () => {
    if (!firstDone) {
      firstDone = true;
      done();
    }
  });
});

gulp.task("build:webpack", done => {
  compiler.purgeInputFileSystem();
  compiler.run(done);
});

gulp.task("build:content-hash", () => {
  let hashes = [
    `.tmp/webpacked/main.bundle.js`,
    `.tmp/webpacked/head.bundle.js`,
    `.tmp/css/main.css`
  ].map(sha1ForFile);

  let contentHash = sha1(hashes.join(":")).slice(0, 8);

  //only filter out the root index.html
  let notIndexFilter = $.filter(file => file.relative !== "index.html");


  return gulp.src([
    `.tmp/webpacked/**/*`,
    `.tmp/css/**/*`
  ])
    // inject base reference
    .pipe($.replace(/<!--\s*mcs:content-base\s*-->/g, `<base href="${contentHash}/">`))
    // move underneath base hash
    .pipe(notIndexFilter)
    .pipe($.rename(path => {
      path.dirname += '/' + contentHash;
    }))
    .pipe(notIndexFilter.restore())
    .pipe(gulp.dest('.tmp/hashed'));
});

gulp.task("build:copy-to-dist", () => {
  let basePath = '.tmp/hashed';
  return gulp.src(basePath + "/**/*")
    .pipe($.gzip())
    .pipe(gulp.dest('./dist/'));
});

gulp.task("build:make-compiler", () => {
  if (compiler) { return; }
  let options = webpackConfig(cli.env, {});

  if(cli.verbose) {
    $.util.log("Starting webpack compiler with options:");
    $.util.log(JSON.stringify(options, null, "  "));
  }

  compiler = webpack(options);

  compiler.plugin("compile", () => {
    spinner = new Spinner('Compiling...   ');
    spinner.start();
  });

  compiler.plugin("compilation", function(compilation) {
    compilation.plugin("optimize", function() {
      spinner.message('Optimizing...                  ');
    });

    compilation.plugin("build-module", function() {
      spinner.message('Building modules...            ');
    });

    compilation.plugin("before-chunk-assets", function() {
      spinner.message('Creating the chunk assets...   ');
    });

    compilation.plugin("before-hash", function() {
      spinner.message('Hashing compilation...         ');
    });
  });

  compiler.plugin('done', stats => {
    if (spinner) {
      spinner.stop();
    }
    fs.writeFileSync('.tmp/webpacked/BUILT_AT', (new Date()).toString());
    fs.writeFileSync('.tmp/stats.json', JSON.stringify(stats.toJson()));
    console.log(stats.toString({
      hash: false,
      version: false,
      timings: true,
      chunks: false,
      colors: true
    }));
  });
});

gulp.task('build-atom', done => {
  runSequence(
    "build-atom:build-zip",
    "build-atom:move-zip",
    "build-atom:unzip",
    "build-atom:delete-zip",
    done);
});

gulp.task('build-atom:build-zip', ['build'], () => {
  return gulp.src([
    `.tmp/hashed/**/*`,
    // TODO
    //`support/atom/**/*`,
  ])
    .pipe($.atomShell({
      version: '0.20.4',
      productName: cli.app,
      productVersion: '0.0.1',
      platform: 'darwin'
    }))
    .pipe($.atomShell.zfsdest(`./app.zip`))
    ;
});

gulp.task('build-atom:move-zip', () => {
  return gulp.src(`./app.zip`)
    .pipe(gulp.dest(`./dist/atom/`))
    ;
});

gulp.task('build-atom:unzip', () => {
  return gulp.src(`./dist/atom/app.zip`)
    .pipe($.shell('unzip -oqq <%= file.path %> -d ./dist/atom/app'))
    ;
});

gulp.task('build-atom:delete-zip', done => {
  del([`./${cli.app}.zip`], done);
});

function sha1ForFile(path) {
  let content = fs.readFileSync(path);
  return sha1(content);
}

function sha1(content) {
  return crypto.createHash('sha1').update(content).digest('hex');
}
