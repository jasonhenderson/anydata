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

var DataHelper = require('../helpers/data')

module.exports.controller = function(app) {
    app.route('/upload')
        .get(function (req, res) {
            res.render('pages/upload');
        })
        .post(function (req, res, next) {

            console.log('processing upload');
            if (!req.body.jsonData || !req.body.jsonData.length) {
                DataHelper.processError("No JSON data was provided", res)
                return next();
            }

            if (!req.body.filePath || !req.body.filePath.length) {
                DataHelper.processError("No path for the file was provided", res)
                return next();
            }

            DataHelper
                .getPathInfo(req, req.body.filePath)
                .then(function(pathInfo) {
                    return DataHelper.saveJson(pathInfo, JSON.parse(req.body.jsonData))
                })
                .then(function(pathInfo) {
                    res.jsonp({
                        url: pathInfo.host + pathInfo.subdir + pathInfo.file
                    });
                })
                .catch(function(err) {
                    DataHelper.processError(err, res)
                })
        });
}