"use strict";

var fs = require("fs");
var path = require("path");
var recursive = require("recursive-readdir");
var basename  = path.basename(module.filename);

module.exports = function(app) {
    recursive(__dirname, [".*", module.filename], function(err, files){
        files.map(function(file){
            var relative = path.relative(__dirname, file);
            var moduleName = path.dirname(relative) +
                    path.sep + path.basename(relative, ".js");
            if (moduleName.slice(0, 2) != "./") {
                moduleName = "./" + moduleName;
            }
            console.log(moduleName);
            var mod = require(moduleName);
            if (typeof mod === "function") {
                mod(app);
            }
        });
    });
}
