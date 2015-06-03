import {merge} from "./util";

export default function makeConfig(options) {
  var result = {};

  merge(result, baseConfig());
  merge(result, options || {});

  return result;
}

function baseConfig() {
  return {
    files: [ 
      'node_modules/mocha-lazy-bdd/dist/mocha-lazy-bdd.js',
      'test/helper.es6',
    ],
    webpack: {
      devtool: "inline-source-map",
      module: {
        loaders: [
          { test: /\.es6$/, loader: 'node_modules/interstellar-core/node_modules/babel-loader' },
        ]
      },
      resolve: {
        root: [`${__root}/lib`],
        extensions: ["", ".js", ".es6"],
        modulesDirectories: ["modules", "node_modules"],
      }
    },
    basePath:       '',
    frameworks:     ['mocha'],
    client: {
      captureConsole: true,
    },
    exclude:        [],
    preprocessors:  { '**/*.es6': ['webpack'] },
    logLevel:       "DEBUG",
    reporters:      ['dots'],
    port:           9876,
    colors:         true,
    autoWatch:      true,
    browsers:       ['Firefox'],
    // browsers:       ['PhantomJS'],
    singleRun:      false,
    webpackServer:  { noInfo: true },
    browserNoActivityTimeout: 60000,
  };
}
