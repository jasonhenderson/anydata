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
$(function () {

    // Bind the pills
    $('#optionTabs a').click(function (e) {
        e.preventDefault()
        $(this).tab('show')
    })

    // Clear button under results
    $("#clearResultsButton").click(function () {
        $("#results").html("<pre> </pre>")
        $("#resultsHeader").html("<h4>Results</h4>")
    })

    ////////////////////////////////////////////////////////////////////////////////
    // Pill actions
    ////////////////////////////////////////////////////////////////////////////////

    // Get Sheet JSON: /sheet/:fileId
    $("#sheet button").click(function () {
        var fileId = $("#sheet input").val()
        getFromServer("/sheet/" + fileId, $(this))
    })

    // Get Sheet URL: /sheet/url/:fileId
    $("#sheetEditUrl button").click(function () {
        var fileId = $("#sheetEditUrl input").val()
        getFromServer("/sheet/url/" + fileId, $(this))
    })

    $("#sheetJsonUrl button").click(function () {
        var fileId = $("#sheetJsonUrl input").val()
        getFromServer("/sheet/url/json/" + fileId, $(this))
    })

    // New Folder: /drive/folders/new
    $("#newFolder button").click(function () {
        postToServer("/drive/folders/new", {
            "title": $("#newFolder input").val()
        }, $(this))
    })

    // New Sheet: /sheets/new
    $("#newSheet button").click(function () {
        var inputs =  $("#newSheet input")
        postToServer("/sheets/new", {
            "folderId": inputs.eq(0).val(),
            "title": inputs.eq(1).val(),
            "email": inputs.eq(2).val()
        }, $(this))
    })

    // Get Sheet Info: /sheet/info/:fileId
    $("#sheetInfo button").click(function () {
        var fileId = $("#sheetInfo input").val()
        getFromServer("/sheet/info/" + fileId, $(this))
    })

    // Get Files List: /drive/files/:folderId?
    $("#getFiles button").click(function () {
        var folderId = $("#getFiles input").val()
        getFromServer("/drive/files/" + folderId, $(this))
    })

    // Get Folders List: /drive/folders/:folderId?
    $("#getFolders button").click(function () {
        var folderId = $("#getFolders input").val()
        getFromServer("/drive/folders/" + folderId, $(this))
    })

    // Find: /drive/find/:title
    $("#find button").click(function () {
        var text = $("#find input").val()
        getFromServer("/drive/find/" + text, $(this))
    })

    // Info: /drive/info/:fileId?
    $("#info button").click(function () {
        var fileId = $("#info input").val()
        getFromServer("/drive/info/" + fileId, $(this))
    })

    // Rename: /drive/rename/:fileId/:title
    $("#rename button").click(function () {
        var fileId = $("#rename input").eq(0).val()
        var title = $("#rename input").eq(1).val()
        getFromServer("/drive/rename/" + fileId + "/" + title, $(this))
    })

    // Trash: /drive/trash/:fileId
    $("#trash button").click(function () {
        var fileId = $("#trash input").val()
        deleteFromServer("/drive/file/" + fileId, $(this))
    })

    // Untrash: /drive/untrash
    $("#untrash button").click(function () {
        postToServer("/drive/untrash", {
            "fileId": $("#untrash input").val()
        }, $(this))
    })

    // Empty Trash: /drive/emptyTrash
    $("#emptyTrash button").click(function () {
        bootbox.confirm({
            message: "Are you SURE you want to remove all items in the trash?",
            buttons: {
                confirm: {
                    label: 'Yes, Empty Trash',
                    className: 'btn-danger'
                },
                cancel: {
                    label: 'Cancel',
                    className: 'btn-default'
                }
            },
            callback: function(answer) {
                if (answer) {
                    deleteFromServer("/drive/emptyTrash", $(this))
                }
            }
        })
    })
})

// Convenience function for getting
function getFromServer(url, element) {
    ajaxServer({
        url: url,
        dataType: "json",
        method: "GET"
    }, element)
}

// Convenience function for deleting
function deleteFromServer(url, element) {
    ajaxServer({
        url: url,
        dataType: "json",
        method: "DELETE"
    }, element)
}

// Convenience function for posting
function postToServer(url, data, element) {
    ajaxServer({
        url: url,
        dataType: "json",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(data)
    }, element)
}

// Runs all ajax calls to the server
function ajaxServer(config, element) {
    element.button('loading')
    $.ajax(config)
        .done(function (result) {
            setResults(result, element, "success", "Call was successful!")
        })
        .fail(function (err) {
            setResults(err.responseJSON, element, "danger", "Error processing")
        })
        .always(function () {
            element.button('reset')
        })
}

// For setting the results columns
function setResults(resultJson, element, alertType, alertMessage) {
    // Create the HTML that will go inside the results container
    var resultsHtml = ""
    if (alertType) resultsHtml += ("<div class=\"alert alert-" + alertType + "\" role=\"alert\">" + alertMessage + "</div>")
    if (resultJson) resultsHtml += ("<pre>" + JSON.stringify(resultJson, null, 2) + "</pre>")
    if (resultJson.url) resultsHtml += ("<a target='_blank' href='" + resultJson.url + "' class='btn btn-default btn-xs'>Click to Open</a>")

    // Add results to the container
    $("#results").html(resultsHtml)

    // If header text was provided, set it
    var headerText = element.data("results")
    $("#resultsHeader").html("<h4>" + (headerText && headerText.length ? "Results for " + headerText : "Results") + "</h4>")
}