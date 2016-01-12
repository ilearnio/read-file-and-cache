# read-file-and-cache

Reads files and caches results (in memory). If the file was modified, will return updated version of it (options available)

## Use cases

* Imagine, you have an .html layout, which your server outputs to the client
on every request. You don't want to read the file every time but still want to
check, once in a while, whether it was changed, so then you can respond with the
new version of it.
* Same layout, but now you need to respond always with a cached version of it
when you're in production environment. But when in development, you want to
respond always with the fresh version of the file

## Install

```
$ npm install --save read-file-and-cache
```


## Usage

```js
const readFileAndCache = require('read-file-and-cache')

//
// using a callback
//
readFileAndCache(filepath, function(err, result) {
  // ...
})

//
// or a Promise
//
readFileAndCache(filepath).then(function(result) {
  // ...
})

//
// or syncronously
//
const readFileAndCacheSync = require('read-file-and-cache').sync
// ES6: import { readFileAndCacheSync } from 'read-file-and-cache'

let result = readFileAndCacheSync(filepath)

//
// Give it some options
//
let result = readFileAndCache(filepath, {
  // Read synchronously (default: false)
  sync: true,
  // If true, cache for a file will be never updated (default: false)
  never_update: process.env.NODE_ENV === 'production', // never update cache when in production
  // Delay between checks for file modifications in sec. (default: 0)
  check_delay: 3600 // check for updates every hour
})
```
