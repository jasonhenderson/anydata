# DataStorer

Ever try to use some good data, or a good API on the web only to find that the developer did not
implement CORS and/or jsonp correctly?

Well, I have, and it is pretty annoying, particularly when you are trying to teach others how to work
with all that wonderful data out there.

`corsfix` takes care of both.

 > This is not intended to support production, so it is pretty skinny on error handling, etc.

## What It's Doing

1. Add CORS headers to the response.
2. Allow for `json` and `jsonp` requests.

## Getting and Running the Code

```sh
$ git clone https://github.com/jasonhenderson/corsfix.git # or clone your own fork
$ cd corsfix
$ npm install
$ npm start
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

## Deploying to Digital Ocean

[Follow this guide to setup](https://glebbahmutov.com/blog/running-multiple-applications-in-dokku/).
It is a little outdated but should get you up and running, fairly decently.

Then, push up your code and away you go...
```
$ git push dokku master
```

