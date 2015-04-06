var requireFiles = require("../utils/require.files");
module.exports = function (server) {
  requireFiles(__dirname, __dirname, server);
}
