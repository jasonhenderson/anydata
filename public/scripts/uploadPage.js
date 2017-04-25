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

 Created by jasonhenderson on 4/25/17.
 */

$(function () {
    clearFileInputAlert()

    $('#fileInputButton').click(function () {
        clearFileInputAlert()
        $('#fileInput').trigger('click')
    })

    $('#fileInput').change(function () {
        if (!window.FileReader) {
            return showFileInputAlert('FileReader API is not supported by your browser.')
        }

        var input = $(this)[0] // Put file input ID here

        if (input.files && input.files[0]) {
            var file = input.files[0]; // The file
            var reader = new FileReader(); // FileReader instance
            reader.onload = function () {
                // Do stuff on onload, use fr.result for contents of file
                try {
                    var formattedJSON = JSON.stringify(JSON.parse(reader.result), null, 4)
                    $('#jsonDataText').val(formattedJSON)
                }
                catch (e) {
                    showFileInputAlert("Error reading file")
                }
            };
            reader.readAsText(file);
        } else {
            // Handle errors here
            showFileInputAlert("File not selected or browser incompatible.")
        }
    });

    clearUploadAlert()
    setProgress() // will hide it

    $('#uploadButton').click(function (e) {
        setProgress()
        clearUploadAlert()

        var formData = new FormData($('form')[0]);

        $.ajax({
            url: "/upload",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            mimeType: "multipart/form-data",
            cache: false,
            xhr: function () {
                //upload Progress
                var xhr = $.ajaxSettings.xhr();
                if (xhr.upload) {
                    xhr.upload.addEventListener('progress', function (event) {
                        var percent = 0;
                        var position = event.loaded || event.position;
                        var total = event.total;
                        if (event.lengthComputable) {
                            percent = Math.ceil(position / total * 100);
                        }
                        //update progressbar
                        setProgress(percent);
                    }, true);
                }
                return xhr;
            }
        }).done(function (data) {
            console.log('upload done');
            console.log(data);
        }).fail(function (xhr) {
            setProgress() // hide it
            showUploadAlert(JSON.parse(xhr.responseText).message)
            console.log('upload failed');
            console.log(xhr);
        }).always(function () {
            //console.log('done processing upload');
        });
    });
})

function setProgress(percent) {
    if (typeof percent == 'undefined') {
        $('.progress').hide()
        percent = 0
    }
    else {
        $('.progress').show()
    }
    $(".progress-bar").css("width", + percent + "%");
    $(".progress-bar").text(percent + "%");
}

function showFileInputAlert(message) {
    $('#fileInputAlert > span').html(message)
    $('#fileInputAlert').show()
}

function clearFileInputAlert() {
    $('#fileInputAlert > span').html("")
    $('#fileInputAlert').hide()
}

function showUploadAlert(message) {
    $('#uploadAlert > span').html(message)
    $('#uploadAlert').show()
}

function clearUploadAlert() {
    $('#uploadAlert > span').html("")
    $('#uploadAlert').hide()
}

