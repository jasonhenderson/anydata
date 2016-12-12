/**
 This file is part of DataStorer.

 DataStorer is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 DataStorer is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with DataStorer.  If not, see <http://www.gnu.org/licenses/>.

 Created by jasonhenderson on 12/8/16.
 */

//const path = require('path');
const fs = require('fs');

module.exports.controller = function(app) {
    app.route('/uploadAjax')
        .get(function (req, res) {
            res.render('pages/uploadAjax');
        })

    app.route('/upload')
        .get(function (req, res) {
            res.render('pages/upload');
        })
        .post(function (req, res) {

            console.log('processing upload');
            if (req.file) {

            }
            else {
                //res.render('pages/uploadDone');
                res.status(200).json({
                    "message" : "File was successfully uploaded"
                });
            }
        });
}