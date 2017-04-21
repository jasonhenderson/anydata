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

var Google = require('googleapis');
var GoogleSheets = Google.sheets('v4');
var GoogleDrive = Google.drive('v2');
var Promise = require("bluebird");

// PRIVATE

// "https://spreadsheets.google.com/feeds",
var GOOGLE_AUTH_SCOPE = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file"
];

// TODO: consider moving secure variables from environment to non-tracked config file
// Environment variables don't handle \n well, so make sure to adjust the key
var serviceAccountCredentials = {
    email: process.env.GOOG_EMAIL,
    privateKey: process.env.GOOG_KEY.replace(/\\n/g, "\n")
};

var self = module.exports = {

    auth: {},

    token: "",

    authorize: function () {
        return new Promise(function (resolve, reject) {

            // Don't reauth if already done
            if (self.token.length) return resolve(self.token);

            // File with key or key in a string in next arg, one or the other
            var jwt = new Google.auth.JWT(
                serviceAccountCredentials.email,
                null,
                serviceAccountCredentials.privateKey,
                GOOGLE_AUTH_SCOPE);

            jwt.authorize(function (err, auth) {
                if (err) {
                    reject(err)
                }
                else {
                    self.auth = auth;
                    self.token = auth.access_token;
                    resolve(auth.access_token)
                }
            })
        })

    },

    addPermission: function (fileId, role, email) {
        return new Promise(function (resolve, reject) {
            // Always make sure we are authorized
            if (!self.token.length) return reject("Not authorized")

            var permission = {
                'role': role
            };

            if (email && email.length) {
                permission.type = 'user';
                permission.emailAddress = email
            }
            else {
                permission.type = 'anyone';
                permission.value = 'default'
            }

            GoogleDrive.permissions.insert({
                fileId: fileId,
                resource: permission,
                bearer_token: self.token
            }, function (err) {
                if (err) {
                    reject(err)
                }
                else {
                    // Carry fileId forward
                    resolve(fileId)
                }
            })
        })
    },

    createSheet: function (title) {
        return new Promise(function (resolve, reject) {
            // Always make sure we are authorized
            if (!self.token.length) return reject("Not authorized")

            var request = {
                bearer_token: self.token,
                resource: {
                    properties: {
                        title: title
                    }
                }
            }

            GoogleSheets.spreadsheets.create(request, function (err, res) {
                if (err) {
                    console.log(err);
                    reject(err)
                }
                else {
                    resolve(res.spreadsheetId)
                }
            })
        })
    },

    createFolder: function (title) {
        return new Promise(function (resolve, reject) {
            // Always make sure we are authorized
            if (!self.token.length) return reject("Not authorized")

            var fileMetadata = {
                'title': title,
                'mimeType': 'application/vnd.google-apps.folder'
            };

            GoogleDrive.files.insert({
                bearer_token: self.token,
                resource: fileMetadata,
                fields: 'id'
            }, function (err, file) {
                if (err) {
                    reject(err)
                } else {
                    resolve(file.id)
                }
            });
        })
    },

    moveToFolder: function (fileId, folderId) {
        return new Promise(function (resolve, reject) {
            // Always make sure we are authorized
            if (!self.token.length) return reject("Not authorized")

            // Make sure file and folder were provided
            if (!fileId || !fileId.length) return reject("File ID not provided")
            if (!folderId || !folderId.length) folderId = "root"

            GoogleDrive.files.get({
                bearer_token: self.token,
                fileId: fileId,
                fields: 'parents'
            }, function (getErr, file) {
                if (getErr) {
                    reject(getErr)
                }
                else {
                    // Move the file to the new folder
                    var previousParents = file.parents.map(function (parent) {
                        return parent.id
                    }).join(',');

                    GoogleDrive.files.update({
                        bearer_token: self.token,
                        fileId: fileId,
                        addParents: folderId,
                        removeParents: previousParents,
                        fields: 'id, parents'
                    }, function (updateErr, updatedFile) {
                        if (updateErr) {
                            reject(updateErr)
                        } else {
                            console.log(updatedFile)
                            resolve(updatedFile)
                        }
                    });
                }
            });
        })
    },

    getFolderInfos: function (title) {
        return new Promise(function (resolve, reject) {
            // Always make sure we are authorized
            if (!self.token.length) return reject("Not authorized")

            var query = "mimeType='application/vnd.google-apps.folder'"
            if (title && title.length) query += (" and title='" + title + "'")

            searchFiles(null, query, function (err, files) {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(files)
                }
            })
        })
    },

    findInfos: function (title) {
        return new Promise(function (resolve, reject) {
            // Always make sure we are authorized
            if (!self.token.length) return reject("Not authorized")

            // Make sure file and folder were provided
            if (!title || !title.length) return reject("Title not provided")

            var query = "title contains '" + title + "'"

            searchFiles(null, query, function (err, files) {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(files)
                }
            })
        })
    },

    getInfo: function (fileId) {
        return new Promise(function (resolve, reject) {
            // Always make sure we are authorized
            if (!self.token.length) return reject("Not authorized")

            // Make sure file and folder were provided
            if (!fileId || !fileId.length) return reject("File ID not provided")

            GoogleDrive.files.get({
                bearer_token: self.token,
                fileId: fileId,
            }, function (err, fileInfo) {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(fileInfo)
                }
            });
        })
    },

    rename: function (fileId, title) {
        return new Promise(function (resolve, reject) {
            // Always make sure we are authorized
            if (!self.token.length) return reject("Not authorized")

            // Make sure file and folder were provided
            if (!fileId || !fileId.length) return reject("File ID not provided")
            if (!title || !title.length) return reject("Title not provided")

            GoogleDrive.files.update({
                bearer_token: self.token,
                fileId: fileId,
                resource: {
                    'title': title
                }
            }, function (err, fileInfo) {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(fileInfo)
                }
            });
        })
    },

    trash: function (fileId) {
        return new Promise(function (resolve, reject) {
            // Always make sure we are authorized
            if (!self.token.length) return reject("Not authorized")

            // Make sure folder and file are provided
            if (!fileId || !fileId.length) return reject("File ID not provided")

            GoogleDrive.files.trash({
                bearer_token: self.token,
                'fileId': fileId
            }, function (err) {
                if (err && err.length) {
                    // Handle error
                    reject(err)
                } else {
                    console.log(err)
                    resolve()
                }
            });
        })
    },

    untrash: function (fileId) {
        return new Promise(function (resolve, reject) {
            // Always make sure we are authorized
            if (!self.token.length) return reject("Not authorized")

            // Make sure file was provided
            if (!fileId || !fileId.length) return reject("File ID not provided")

            GoogleDrive.files.untrash({
                bearer_token: self.token,
                'fileId': fileId
            }, function (err) {
                if (err && err.length) {
                    // Handle error
                    reject(err)
                } else {
                    resolve()
                }
            });
        })
    },

    emptyTrash: function () {
        return new Promise(function (resolve, reject) {
            // Always make sure we are authorized
            if (!self.token.length) return reject("Not authorized")

            GoogleDrive.files.emptyTrash({
                bearer_token: self.token
            }, function (err) {
                if (err && err.length) {
                    // Handle error
                    reject(err)
                } else {
                    resolve()
                }
            });
        })
    },

    getFiles: function (folderId) {
        return new Promise(function (resolve, reject) {
            // If no folderId was provided, assume root
            if (!folderId || !folderId.length) folderId = "root"

            // Only getting files
            var query = "mimeType!='application/vnd.google-apps.folder'"
            getChildrenIds(null, folderId, query, function (err, files) {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(files)
                }
            })
        })
    },
};

function searchFiles(pageToken, query, callback) {

    // Get all results, paged if directed by the server
    GoogleDrive.files.list({
        bearer_token: self.token,
        q: query,
        fields: 'nextPageToken, items(id, title, mimeType, parents)',
        spaces: 'drive',
        pageToken: pageToken
    }, function (listErr, res) {
        if (listErr) {
            callback(listErr);
        }
        else {
            if (res.items) {
                if (res.nextPageToken) {
                    searchFiles(res.nextPageToken, query, function (nextErr, files) {
                        if (nextErr) {
                            callback(nextErr)
                        }
                        else {
                            callback(null, res.items.concat(files))
                        }
                    });
                }
                else {
                    callback(null, res.items);
                }
            }
            else {
                callback(null, [])
            }
        }
    });
}

function getChildrenIds(pageToken, folderId, query, callback) {

    // Get all results, paged if directed by the server
    GoogleDrive.children.list({
        bearer_token: self.token,
        folderId: folderId,
        q: query,
        pageToken: pageToken
    }, function (listErr, res) {
        if (listErr) {
            callback(listErr);
        }
        else {
            if (res.items) {
                var ids = res.items.map(function (x) {
                    // Just care about ids
                    return x.id
                })

                if (res.nextPageToken) {
                    getChildrenIds(res.nextPageToken, folderId, query, function (nextErr, nextIds) {
                        if (nextErr) {
                            callback(nextErr)
                        }
                        else {
                            callback(null, ids.concat(nextIds))
                        }
                    });
                }
                else {
                    callback(null, ids);
                }
            }
            else {
                callback(null, [])
            }
        }
    });
}
