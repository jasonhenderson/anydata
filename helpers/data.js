var mime = require('mime-types');
var path = require('path');
var mkdirp = require('mkdirp');
var fs = require('fs');
var Promise = require("bluebird");

var self = module.exports = {
    saveJson: function (pathInfo, json) {
        return new Promise(function (resolve, reject) {
            mkdirp(pathInfo.dir, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    // If the current file exists, you will be removing it and creating a new one.
                    // Save the posted data to the file
                    // TODO: convert to non-blocking version
                    if (fs.existsSync(pathInfo.path)) {
                        fs.unlinkSync(pathInfo.path);
                    }

                    fs.appendFile(pathInfo.path, JSON.stringify(json), function (err) {
                        if (err) {
                            console.log("err saving", json, pathInfo)
                            reject(err)
                        }
                        else {
                            resolve(pathInfo)
                        }
                    });
                }
            })
        })
    },

    addObjectToArray: function (pathInfo, newObject, targetProperty) {
        return new Promise(function (resolve, reject) {
            mkdirp(pathInfo.dir, function (err) {
                if (err) {
                    console.log("error making directory", pathInfo)
                    reject(err);
                }
                else {
                    // If the current file exists, open it, parse the array, then add the object to the end
                    // If not, create a new array and add the object to it
                    // TODO: convert to non-blocking version
                    if (fs.existsSync(pathInfo.path)) {
                        fs.readFile(pathInfo.path, 'utf8', function (err, data) {
                            if (err) {
                                return reject("Error reading the file for addition")
                            }

                            var existingJson = JSON.parse(data)

                            if (typeof existingJson === 'object' && targetProperty && targetProperty.length) {
                                var existingProperty = existingJson[targetProperty]
                                if (!existingProperty) {
                                    existingProperty = []
                                    existingProperty.push(newObject)
                                    existingJson[targetProperty] = existingProperty
                                }
                                else if (existingProperty instanceof Array) {
                                    existingProperty.push(newObject)
                                }
                                else {
                                    return reject("Cannot overwrite existing value")
                                }
                            }
                            else if (typeof existingJson === 'object' && (existingJson instanceof Array)) {
                                existingJson.push(newObject)
                            }
                            else {
                                return reject("Cannot add unless there is an array or target property provided")
                            }

                            // return resolve(self.saveJson(pathInfo, existingJson));
                            return resolve(existingJson)
                        });
                    }
                    else {
                        var existingJson = undefined

                        if (targetProperty && targetProperty.length) {
                            existingJson = {}
                            existingJson[targetProperty] = []
                            existingJson[targetProperty].push(newObject)
                        }
                        else {
                            existingJson = []
                            existingJson.push(newObject)
                        }

                        // return resolve(self.saveJson(pathInfo, existingJson));
                        return resolve(existingJson)
                    }
                }
            })
        })
    },

    loadJson: function (pathInfo) {
        return new Promise(function (resolve, reject) {
            // TODO: convert to non-blocking version
            if (fs.existsSync(pathInfo.path)) {
                fs.readFile(pathInfo.path, 'utf8', function (err, data) {
                    if (err) {
                        reject({
                            status: 500,
                            message: "Error opening the file"
                        })
                    }
                    resolve(JSON.parse(data));
                });
            }
            else {
                reject({
                    status: 404,
                    message: "No such file yet"
                })
            }
        })
    },

    getRequestPathInfo: function (req) {
        return new Promise(function (resolve, reject) {
            if (!req) return reject("No request to process")

            var extension = path.extname(req.path);
            //console.log('extension: ' + extension);

            var storageDir = process.env.STORAGE_DIR || './data_files';

            var segments = req.path.split(path.sep);
            var firstSegment = segments && segments.length ? segments[1] : "";

            var dirName = path.dirname(req.path).replace(path.sep + firstSegment, storageDir);
            var subDirName = dirName.replace(storageDir, '')
            //console.log('directory name: ' + dirName);

            var fileName = path.basename(req.path).replace(extension, '')
            //console.log('file name: ' + fileName);
            var fileNameWithExt = fileName + extension

            var filePath = dirName + '/' + fileNameWithExt;
            //console.log('file path: ' + filePath);
            //console.log('current dir: ' + __dirname);

            var port = req.app.get('port')

            resolve({
                "host": req.protocol + "://" + req.hostname + (req.hostname == "localhost" ? ":" + port : ""),
                "subdir": subDirName,
                "file": fileNameWithExt,
                "dir": dirName,
                "path": filePath
            })
        })
    },

    getPathInfo: function (req, input) {

        return new Promise(function (resolve, reject) {
            if (!input) {
                return reject("No request to process")
            }

            var inputPath = path.dirname(input)
            var extension = path.extname(input);
            //console.log('extension: ' + extension);
            var fileName = path.basename(input).replace(extension, '')
            //console.log('file name: ' + fileName);
            var fileNameWithExt = fileName + extension

            var storageDir = process.env.STORAGE_DIR || './data_files';
            var dirName = storageDir.rtrim('/') + "/" + inputPath.ltrim('/')

            var subDirName = dirName.replace(storageDir, '')
            // console.log('subdirectory name: ' + subDirName);

            var filePath = dirName + '/' + fileNameWithExt;
            // console.log('file path: ' + filePath);

            var port = req.app.get('port')

            resolve({
                "host": req.protocol + "://" + req.hostname + (req.hostname == "localhost" ? ":" + port : ""),
                "subdir": subDirName,
                "file": fileNameWithExt,
                "dir": dirName,
                "path": filePath
            })
        })
    },

    processError: function (err, res) {
        if (err && typeof err === 'object' && err.status) {
            res.status(err.status).send(err.message);
        }
        else if (err && typeof err === 'string') {
            res.status(500).send({
                message: err
            });
        }
        else {
            res.status(500).send({
                message: "Error processing file",
                error: err
            });
        }
    }
}

String.prototype.ltrim = function (mask) {
    var s = this.slice(0)
    while (~mask.indexOf(s[0])) {
        s = s.slice(1);
    }
    return s;
}

String.prototype.rtrim = function (mask) {
    var s = this.slice(0)
    while (~mask.indexOf(s[s.length - 1])) {
        s = s.slice(0, -1);
    }
    return s;
}

