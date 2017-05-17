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

module.exports.controller = function (app) {

    app.route('/addToList/*')
        .post(function (req, res) {
            DataHelper
                .getRequestPathInfo(req)
                .then(function (pathInfo) {
                    return DataHelper
                        .addObjectToArray(pathInfo, req.body, req.query.prop)
                        .then(function (json) {
                            return DataHelper.saveJson(pathInfo, json)
                        })
                })
                .then(function (pathInfo) {
                    res.jsonp({
                        url: pathInfo.host + '/data' + pathInfo.subdir + '/' + pathInfo.file
                    });
                })
                .catch(function (err) {
                    DataHelper.processError(err, res)
                })
        })

    app.route('/data/*')
        .get(function (req, res) {

            // Query string parameter "url" which is the complete URL we want to re-route
            DataHelper
                .getRequestPathInfo(req)
                .then(function (pathInfo) {
                    return DataHelper.loadJson(pathInfo)
                })
                .then(function (data) {
                    res.jsonp(data);
                })
                .catch(function (err) {
                    DataHelper.processError(err, res)
                })
        })

        .post(function (req, res) {
            DataHelper
                .getRequestPathInfo(req)
                .then(function (pathInfo) {
                    return DataHelper.saveJson(pathInfo, req.body)
                })
                .then(function (pathInfo) {
                    res.jsonp({
                        url: pathInfo.host + pathInfo.subdir + pathInfo.file
                    });
                })
                .catch(function (err) {
                    DataHelper.processError(err, res)
                })
        });
}