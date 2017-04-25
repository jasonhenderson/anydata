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

 Created by jasonhenderson on 4/18/17.
 */

var GoogleHelper = require("../helpers/google")
// TODO: For updating the spreadsheet
var GoogleSheet = require('google-spreadsheet')
var GoogleSheetJson = require('google-spreadsheet-to-json')

module.exports.controller = function (app) {

    app.route('/sheets/:folderId?')
        .get(function (req, res) {
            GoogleHelper.authorize()
                .then(function() {
                    return GoogleHelper.getFiles(req.params.folderId)
                })
                .then(function(files) {
                    res.jsonp(files)
                })
                .catch(function (err) {
                    res.status(500).send({
                        'message': 'Could not get the list of the sheets',
                        'error': err
                    });
                })
        })

    app.route('/sheet/info/:fileId')
        .get(function (req, res) {
            if (!req.params.fileId || !req.params.fileId.length) {
                res.status(500).send({
                    'message': 'File ID is required'
                });
                return next();
            }

            GoogleHelper.authorize()
                .then(function() {
                    return GoogleHelper.getSheet(req.params.fileId);
                })
                .then(function(sheet) {
                    res.jsonp(sheet)
                })
                .catch(function (err) {
                    res.status(500).send({
                        'message': 'Could not get the sheet info',
                        'error': err
                    });
                })
        })

    app.route('/sheet/:fileId')
        .get(function (req, res) {
            if (!req.params.fileId || !req.params.fileId.length) {
                res.status(500).send({
                    'message': 'File ID is required'
                });
                return next();
            }

            GoogleHelper.authorize()
                .then(function() {
                    return GoogleHelper.getSheet(req.params.fileId)
                })
                .then(function(sheetInfo) {
                    var sheetNames;
                    if (sheetInfo && sheetInfo.sheets) {
                        sheetNames = sheetInfo.sheets.map(function(sheet) {
                            return sheet.properties.title
                        })
                    }
                    return new GoogleSheetJson({
                        token: GoogleHelper.token,
                        spreadsheetId: req.params.fileId,
                        worksheet: sheetNames
                    });
                })
                .then(function(sheetJson) {
                    res.jsonp(sheetJson)
                })
                .catch(function (err) {
                    res.status(500).send({
                        'message': 'Could not get the sheet in JSON format',
                        'error': err
                    });
                })
        })

        .post(function (req, res) {

            // TODO: Process json that was posted

            res.status(200).send({'message': 'Sheet posted!'});
        });

    app.route('/sheet/url/:fileId')
        .get(function (req, res) {
            if (!req.params.fileId || !req.params.fileId.length) {
                res.status(500).send({
                    'message': 'File ID is required'
                });
                return next();
            }

            res.jsonp({
                "url" : "https://docs.google.com/spreadsheets/d/" + req.params.fileId + "/edit#gid=0"
            });
        })

    app.route('/sheets/new')
        .post(function (req, res, next) {

            if (!req.body.folderId || !req.body.folderId.length) {
                res.status(500).send({
                    'message': 'Folder ID is required'
                });
                return next();
            }
            else if (!req.body.title || !req.body.title.length) {
                res.status(500).send({
                    'message': 'Title is required'
                });
                return next();
            }

            GoogleHelper.authorize()
                .then(function() {
                    // Make the sheet
                    return GoogleHelper.createSheet(req.body.title)
                })
                .then(function(fileId) {
                    // Assign the reading permission to everyone
                    return GoogleHelper.moveToFolder(fileId, req.body.folderId)
                })
                .then(function(fileId) {
                    // Assign the writing permission if requested
                    return GoogleHelper.addPermission(fileId, "writer", req.body.email)
                })
                .then(function(fileId) {
                    // Assign the reading permission to everyone
                    return GoogleHelper.addPermission(fileId, "reader")
                })
                .then(function(fileId) {
                    res.jsonp({
                        'id': fileId,
                        'url': 'https://docs.google.com/spreadsheets/d/' + fileId + '/edit#gid=0'
                    });
                })
                .catch(function (err) {
                    res.status(500).send({
                        'message': 'Could not create the sheet',
                        'error': err
                    });
                })
        })

}