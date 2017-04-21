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

module.exports.controller = function (app) {

    app.route('/drive')
        .get(function (req, res) {
            res.render('pages/drive', {});
        })

    app.route('/drive/folders/:folderId?')
        .get(function (req, res) {
            GoogleHelper.authorize()
                .then(function () {
                    return GoogleHelper.getFolderInfos(req.params.folderId)
                })
                .then(function (folders) {
                    res.jsonp(folders.map(function (folder) {
                        return {
                            'id': folder.id,
                            'title': folder.title,
                            'url': 'https://drive.google.com/drive/folders/' + folder.id
                        }
                    }))
                })
                .catch(function (err) {
                    res.status(500).send({
                        'message': 'Could not get the list of the folders',
                        'error': err
                    });
                })
        })

    app.route('/drive/info/:fileId?')
        .get(function (req, res) {
            GoogleHelper.authorize()
                .then(function () {
                    return GoogleHelper.getInfo(req.params.fileId)
                })
                .then(function (fileInfo) {
                    res.jsonp(fileInfo)
                })
                .catch(function (err) {
                    res.status(500).send({
                        'message': 'Could not get the list of the folders',
                        'error': err
                    });
                })
        })

    app.route('/drive/rename/:fileId/:title')
        .get(function (req, res) {
            GoogleHelper.authorize()
                .then(function () {
                    return GoogleHelper.rename(req.params.fileId, req.params.title)
                })
                .then(function (fileInfo) {
                    res.jsonp(fileInfo)
                })
                .catch(function (err) {
                    res.status(500).send({
                        'message': 'Could not get the list of the folders',
                        'error': err
                    });
                })
        })
    app.route('/drive/find/:title')
        .get(function (req, res) {
            GoogleHelper.authorize()
                .then(function () {
                    return GoogleHelper.findInfos(req.params.title)
                })
                .then(function (fileInfo) {
                    res.jsonp(fileInfo)
                })
                .catch(function (err) {
                    res.status(500).send({
                        'message': 'Could not find anything that matches',
                        'error': err
                    });
                })
        })

    app.route('/drive/file/:fileId')
        .delete(trashItem)

    app.route('/drive/folder/:fileId')
        .delete(trashItem)

    app.route('/drive/untrash')
        .post(function (req, res) {
            GoogleHelper.authorize()
                .then(function () {
                    return GoogleHelper.untrash(req.body.fileId)
                })
                .then(function () {
                    res.status(200).send({
                        'message': 'Trash emptied'
                    })
                })
                .catch(function (err) {
                    res.status(500).send({
                        'message': 'Could not empty the trash',
                        'error': err
                    });
                })
        })

    app.route('/drive/emptyTrash')
        .delete(function (req, res) {
            GoogleHelper.authorize()
                .then(function () {
                    return GoogleHelper.emptyTrash()
                })
                .then(function () {
                    res.status(200).send({
                        'message': 'Trash emptied'
                    })
                })
                .catch(function (err) {
                    res.status(500).send({
                        'message': 'Could not empty the trash',
                        'error': err
                    });
                })
        })

    app.route('/drive/files/:folderId?')
        .get(function (req, res) {
            GoogleHelper.authorize()
                .then(function () {
                    return GoogleHelper.getFiles(req.params.folderId)
                })
                .then(function (files) {
                    res.jsonp(files)
                })
                .catch(function (err) {
                    res.status(500).send({
                        'message': 'Could not get the list of the files for the folder',
                        'error': err
                    });
                })
        })
        .delete(function (req, res) {
            GoogleHelper.authorize()
                .then(function () {
                    return GoogleHelper
                        .getFiles(req.params.folderId)
                        .map(function (fileId) {
                            return GoogleHelper.trash(fileId)
                        })
                })
                .then(function (files) {
                    res.jsonp(files)
                })
                .catch(function (err) {
                    res.status(500).send({
                        'message': 'Could not get the list of the files for the folder',
                        'error': err
                    });
                })
        })

    app.route('/drive/folders/new')
        .post(function (req, res) {
            if (!req.body.title || !req.body.title.length) {
                res.status(500).send({
                    'message': 'Title is required'
                });
                return next();
            }

            GoogleHelper.authorize()
                .then(function () {
                    return GoogleHelper.createFolder(req.body.title)
                })
                .then(function (folderId) {
                    // Assign the writing permission to anyone??
                    return GoogleHelper.addPermission(folderId, "writer")
                })
                .then(function (folderId) {
                    res.jsonp({
                        'id': folderId,
                        'url': 'https://drive.google.com/drive/folders/' + folderId
                    });
                })
                .catch(function (err) {
                    res.status(500).send({
                        'message': 'Could not create the folder',
                        'error': err
                    });
                })
        })
}

function trashItem(req, res) {
    GoogleHelper.authorize()
        .then(function () {
            return GoogleHelper.trash(req.params.fileId)
        })
        .then(function () {
            res.status(200).send({
                'id': req.params.fileId,
                'message': 'Item trashed'
            })
        })
        .catch(function (err) {
            res.status(500).send({
                'id': req.params.fileId,
                'message': 'Could not trash the item',
                'error': err
            });
        })
}