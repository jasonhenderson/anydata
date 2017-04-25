# AnyData Server

Store and retrieve data of any content type. Meant for stubbing out projects, or micro projects, or educational purposes.
Specifically, AnyData gives you a place to POST or PUT JSON data and/or images, then GET that data using AJAX
or web `<form>` elements.

 > This is not intended to support production, so it is pretty skinny on error handling, etc.

## What It's Doing

1. Post any content in the body of an AJAX call using your own virtual path.
1. Post any content as part of a multi-part form using your own virtual path.
1. Use the virtual path to get the content.
1. Adds CORS headers by default.

## Getting and Running the Code

```sh
$ git clone https://github.com/jasonhenderson/anydata.git # or clone your own fork
$ cd anydata
$ npm install
$ npm start
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

## Deploying to Digital Ocean via Dokku

[Follow this guide to setup](https://glebbahmutov.com/blog/running-multiple-applications-in-dokku/).
It is a little outdated but should get you up and running, fairly decently.

Then, push up your code and away you go...
```
$ git push dokku master
```

## Retrieve Google Sheet Data as JSON (Edit Google Sheet Directly)

Navigate to the /drive page of the running app and take the following steps:

1. Create a folder for the app. Copy and save the Folder ID you get back.
1. Create a spreadsheet for each set of data required. Remember each spreadsheet can have multiple worksheets inside, 
just like a normal Google Sheet. Copy and save the File ID you get back.
1. Get the url from Sheet Info or from Sheet URL. This will be used to edit the Google Sheet.
1. Use /sheet/fileid to get the json, e.g.
```https://anydata.hensys.com/sheet/aLJJlajdfakaasj8787_uua8&```

### Store JSON via POST


## Store & Retrieve Direct JSON Content via HTTP

The first segment in your URL after the host information needs to be the keyword "data", for
example `https://anydata.somedomain.com/data/`. The virtual directory after that point,
with any number of segments, is up to the user(s). No validation is done by the system on that structure. 
A naming convention that includes an identifier for the different users is recommended, but not required.

*Warning: If two users reference the same url, they will overwrite each other*

### Store JSON via POST

```javascript
$.ajax({
    url: "https://anydata.somedomain.com/data/testing/1.json",
    type: "POST",
    data: JSON.stringify({"message" : "test data"}),
    dataType: "text",
    contentType: "application/json",
}).done(function(data) {
    console.log('successful upload');
    console.log(data);
}).fail(function(xhr) {
    console.log('failed upload');
    console.log(xhr);
}).always(function() {
    console.log('done processing upload');
});
```

### Retrieve JSON via GET

```javascript
$.ajax({
    url: "https://anydata.somedomain.com/data/testing/1.json",
    type: "GET",
    dataType: "json",
}).done(function(data) {
    console.log('succeeded download');
    console.log(data);
}).fail(function(xhr) {
    console.log('failed download');
    console.log(xhr);
}).always(function() {
    console.log('done processing download');
});
```
