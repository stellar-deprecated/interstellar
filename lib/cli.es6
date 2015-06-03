var os   = require('os');

module.exports = {
  app:       $.util.env.app,
  env:       $.util.env.env || "stg",
  platform:  $.util.env.platform || `${os.platform()}-${os.arch()}`,
  verbose:   $.util.env.verbose || false,
  port:      Number($.util.env.port || "8000"),
  awsKey:    $.util.env["aws-key"] || process.env.AWS_ACCESS_KEY_ID,
  awsSecret: $.util.env["aws-secret"] || process.env.AWS_SECRET_ACCESS_KEY,
  awsBucket: $.util.env["aws-bucket"],
};