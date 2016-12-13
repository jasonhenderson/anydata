/**
 This file is part of AnyData Server.

 AnyData Server is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 AnyData Server is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with AnyData Server.  If not, see <http://www.gnu.org/licenses/>.

 Created by jasonhenderson on 12/8/16.
 */
var mime = require('mime-types');
var path = require('path');
var mkdirp = require('mkdirp');
const fs = require('fs');

module.exports.controller = function(app) {

    app.route('/data/*')
        .get(function (req, res) {

            // Query string parameter "url" which is the complete URL we want to re-route
            var pathInfo = getPathInfo(req);

            //console.log('path: ' + pathInfo.path);

            if (fs.existsSync(pathInfo.path)) {
                fs.readFile(pathInfo.path, 'utf8', function (err, data) {
                    if (err) {
                        res.status(500).send('Error processing the file');
                    }
                    res.jsonp(JSON.parse(data));
                });
            }
            else {
                res.status(404).send('No such file...yet!');
            }
        })

        .post(function (req, res) {

            //console.log('processing post of data');
            //console.log(req.headers);

            var pathInfo = getPathInfo(req);

            mkdirp(pathInfo.dir, function (err) {
                if (err) {
                    console.error(err);
                    res.status(500).send('Error saving upload: ' + err);
                }
                else {
                    // Directory made...
                    //console.log('directory made');

                    // If the current file exists, you will be removing it and creating a new one.
                    // Save the posted data to the file
                    if (fs.existsSync(pathInfo.path)) {
                        fs.unlinkSync(pathInfo.path);
                    }

                    fs.appendFile(pathInfo.path, JSON.stringify(req.body), function (err) {
                        if (err) {
                            res.status(500).send('Error saving upload: ' + err);
                        }
                        else {
                            res.status(200).send('File successfully uploaded!');
                        }
                    });
                }
            });
        });

    function getPathInfo(req) {
        var mimeType = req.headers['content-type'];
        console.log('mime type: ' + mimeType);

        var mimeTypeExtension = mime.extension(mimeType);
        console.log('mime type extension: .' + mimeTypeExtension);

        var extension = path.extname(req.path);
        console.log('extension: ' + extension);

        var dirName = path.dirname(req.path).replace('/data', './data_files');
        console.log('directory name: ' + dirName);

        var fileName = path.basename(req.path).replace(extension, '');
        console.log('file name: ' + fileName);

        var filePath = dirName + '/' + fileName + '.' + extension;
        console.log('file path: ' + filePath);
        //console.log('current dir: ' + __dirname);

        return {
            "dir": dirName,
            "path": filePath
        };
    }
}