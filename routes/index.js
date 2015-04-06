var requireFiles = require("../utils/require.files");
module.exports = function (app) {
  requireFiles(__dirname, __dirname, app);
}
