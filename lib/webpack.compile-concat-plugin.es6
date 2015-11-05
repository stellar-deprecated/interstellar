/**
 This plugin concatenates scss files in a correct order and
 then compiles concatenated file.
*/

var autoprefixer = require('autoprefixer-core');
var postcss      = require('postcss');
var path         = require("path");
var fs           = require('fs');
var sass         = require('node-sass');
var _            = require('lodash');
var RawModule    = require('webpack/lib/RawModule');

function CompileConcatPlugin(files, outFile) {
  this.files = files;
  this.outFile = outFile;
}
module.exports = CompileConcatPlugin;
CompileConcatPlugin.prototype.apply = function(compiler) {
  compiler.plugin("emit", (context, callback) => {
    var files = this.files;
    // Concat files
    var filesContents = [];
    for (var file of files) {
      filesContents.push(new Buffer(context.assets[file].source()));
    }

    // Compile
    // TODO allow to update this opts from outside
    var result = sass.renderSync({
      data: Buffer.concat(filesContents).toString(),
      //outFile: this.outFile,
      sourceMap: true,
      //outputStyle: 'compressed',
      includePaths: [
        path.join(process.cwd(), "styles"),
        path.join(process.cwd(), "node_modules"),
        path.join(process.cwd(), "node_modules", "interstellar-core", "node_modules")
      ]
    });

    // We need to add included files to dependencies to make webpack watch them.
    result.stats.includedFiles.forEach(file => {
      context.fileDependencies.push(path.normalize(file));
    });

    // Delete artifacts
    //for (var file of files) {
    //  if (fs.existsSync(file)) {
    //    fs.unlinkSync(file);
    //  }
    //  if (fs.existsSync(file+'.map')) {
    //    fs.unlinkSync(file+'.map');
    //  }
    //}

    // postcss processing
    postcss([autoprefixer])
      .process(result.css, {
        //from: this.outFile,
        //to: this.outFile,
        //map: {
        //  prev: result.map.toString(),
        //  inline: false
        //}
      })
      .then(result => {
        let module = new RawModule(result.css, this.outFile, this.outFile);
        let filename = this.outFile.replace(/\[(?:(\w+):)?contenthash(?::([a-z]+\d*))?(?::(\d+))?\]/ig, module.getSourceHash());
        let chunk = _.find(context.chunks, ch => ch.name === 'main');
        chunk.files.push(filename);
        context.assets[filename] = module.source();
        //fs.writeFileSync(this.outFile, result.css);
        //if (result.map) {
        //  //fs.writeFileSync(this.outFile+'.map', result.map);
        //  compilation.assets[`${this.outFile}.map`] = result.map;
        //}
        callback();
      });
  });
};
