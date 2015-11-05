var path                = require("path");
var _                   = require("lodash");
var webpack             = require("webpack");
var ExtractTextPlugin   = require("extract-text-webpack-plugin");
var CompileConcatPlugin = require("./webpack.compile-concat-plugin");
var HtmlWebpackPlugin   = require('html-webpack-plugin');

let headerSassExtractTextPlugin   = new ExtractTextPlugin(1, "header.scss", {allChunks: true});
let footerSassExtractTextPlugin   = new ExtractTextPlugin(2, "footer.scss", {allChunks: true});
let externalSassExtractTextPlugin = new ExtractTextPlugin(3, "modules.scss", {allChunks: true});

module.exports = makeConfig;

var baseConfig = {
  output: {
    filename: "[name]-[chunkhash].js"
  },
  resolve: {
    root: [process.cwd()],
    extensions: ["", ".js", ".es6", ".json"],
    modulesDirectories: [
      "node_modules/interstellar-core/node_modules",
      "node_modules"
    ],
    fallback: [
      path.join(process.cwd(), "node_modules"),
      path.join(process.cwd(), "node_modules", "interstellar-core", "node_modules")
    ]
  },
  resolveLoader: {
    root: path.join(__dirname, "..", "node_modules")
  },
  module: {
    loaders: [
      {
        test: /\.es6$/,
        loader: 'babel-loader?stage=1'
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /\.(jpe?g|png|gif|svg)/,
        loader: 'file?name=images/[hash].[ext]'
      },
      {
        test: /\.header\.scss$/,
        loader: headerSassExtractTextPlugin.extract("raw"),
        include: path.resolve(process.cwd(), "styles")
      },
      {
        test: /\.footer\.scss$/,
        loader: footerSassExtractTextPlugin.extract("raw"),
        include: path.resolve(process.cwd(), "styles")
      },
      {
        test: /\.scss$/,
        loader: externalSassExtractTextPlugin.extract("raw"),
        exclude: path.resolve(process.cwd(), "styles")
      }
    ]
  },
  plugins: [
    // Ignore native modules (ex. ed25519)
    new webpack.IgnorePlugin(/\.node/),
    headerSassExtractTextPlugin,
    footerSassExtractTextPlugin,
    externalSassExtractTextPlugin,
    new CompileConcatPlugin(['header.scss', 'modules.scss', 'footer.scss'], 'style-[contenthash].css'),
    new webpack.optimize.CommonsChunkPlugin("vendor", "vendor-[chunkhash].js"),
    new HtmlWebpackPlugin({
      template: process.cwd()+'/index.html',
      inject: 'body'
    })
  ]
};

var configForApp = function() {
  return {
    entry: {
      main: "./main.es6",
      head: "./head.es6",
      vendor: ["interstellar-core"]
    },
    output: {
      path: './.tmp/webpacked'
    }
  };
};

var environments = {
  dev: {
    devtool: "eval",
    noInfo: true
  },
  tst: {
    devtool: "inline-source-map"
  },
  stg: {
    devtool: "source-map"
  },
  prd: {
    devtool: "source-map",
    plugins: [
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.optimize.UglifyJsPlugin({
        // TODO investigate more to make this option don't break Angular DI
        mangle: false
      })
    ]
  }
};

function makeConfig(env, options) {
  var result = {};

  merge(result, baseConfig);

  if(env) {
    merge(result, environments[env]);
  }

  merge(result, configForApp());
  merge(result, options || {});

  result.plugins.push(new webpack.DefinePlugin({
    INTERSTELLAR_ENV: JSON.stringify(env)
  }));

  return result;
}

// Does a simple deep merge using lodash
function merge(object, source) {
  return _.merge(object, source, function(a, b) {
    return _.isArray(a) ? a.concat(b) : undefined;
  });
}
