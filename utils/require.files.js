var fs = require('fs'),
    path = require("path"),
    validFileTypes = ['js'];

var requireFiles = function (directory, basedir, param) {
    fs.readdirSync(directory).forEach(function (fileName) {
        // Recurse if directory
        if(fs.lstatSync(directory + '/' + fileName).isDirectory()) {
            requireFiles(directory + '/' + fileName, basedir, param);
        } else {
            // Skip this file
            if(fileName === 'index.js' && directory === basedir) {
                return
            }
            // Skip unknown filetypes
            if(validFileTypes.indexOf(fileName.split('.').pop()) === -1) {
                return;
            }

            // Require the file
            var mod = require(directory + path.sep + fileName);
            if (typeof mod === "function") {
                mod(param);
            }
        }
    });
}

module.exports = requireFiles;
