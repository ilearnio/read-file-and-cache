var fs = require('fs')
var path = require('path')

if (typeof Promise === 'undefined') {
  var Promise = require('es6-promise').Promise
}

var cache = []

/**
 * Reads and caches a file. If the file was changed, returns the updated version
 *
 * @param   {string}  filepath  - path to a file
 * @param   {object|Function}  options | callback
 * @param   {Function|object}  callback  - (optional) a callback function. When
 * object is passed, the attribute behaves like `options` and the function will
 * return a promise (no callback needed)
 * @returns {void|Promise|string} - returns nothing when a callback is given,
 * otherwise returns Promise. Can return a string (result) if `sync: true`
 *
 * Possible options:
 *   sync: false         // Read synchronously
 *   never_update: false // If true, cache for a file will be never updated
 *   check_delay: 0      // Delay between checks for file modifications in sec.
 */
function readFileAndCache(filepath, options, callback) {
  if (filepath[0] === '.')
    filepath = path.join(module.parent.filename, '..', filepath)

  if (typeof options === 'function')
    options = [arguments[2], callback = arguments[1]][0] // swap variables

  if (typeof options === 'undefined')
    options = {}

  var sync = options.sync === true
  var never_update = options.never_update === true
  var check_delay = options.check_delay || 0

  // whether or not to use promise
  var use_promise = typeof callback !== 'function' && !sync

  // check if the file is in cache
  var cached = getFromCache(filepath)

  // need to check for modifications
  var need_check = !never_update && cached && (check_delay === 0 ||
    Date.now() >= cached.last_check + check_delay * 1000)

  // return cached version immediately, without the check for changes
  if (cached && (never_update || !need_check)) {
    if (use_promise)
      return Promise.resolve(cached.content)
    else if (sync)
      return cached.content
    else
      return callback(null, cached.content)
  }

  // return eather a version from cache or the updated version if the file was
  // changed
  if (use_promise) {
    return new Promise(function(resolve, reject) {
      readFile(filepath, function(err, result) {
        if (err) reject(err)
        else resolve(result)
      })
    })
  } else if (sync) {
    return readFile(filepath)
  } else {
    readFile(filepath, callback)
  }
}

function readFileAndCacheSync(filepath, options) {
  options = options || {}
  options.sync = true

  return readFileAndCache(filepath, options)
}

function getFromCache(filepath) {
  for (var i = 0; i < cache.length; i++)
    if (cache[i].filepath === filepath)
      return cache[i]
}

function readFile(filepath, callback) {
  var cached = getFromCache(filepath)

  if (callback) {
    fs.stat(filepath, statCallback)
  } else {
    // synchronously
    var result = fs.statSync(filepath)
    return statCallback(null, result)
  }

  function statCallback(err, stats) {
    if (err) out(err)

    var mtime = +stats.mtime
    // for double check, because on OS X, mtime always rounds to seconds
    var size = stats.size

    // if the file wasn't changed, return cached version
    if (cached && mtime === cached.mtime && size === cached.size)
      return out(null, cached.content)

    var obj = {
      mtime: mtime,
      size: size,
      filepath: filepath,
      last_check: Date.now()
    }

    if (callback) {
      fs.readFile(filepath, 'utf-8', function(err, content) {
        if (err) out(err)

        obj.content = content
        cache.push(obj)

        out(null, content)
      })
    } else {
      var content = fs.readFileSync(filepath, 'utf-8')

      obj.content = content
      cache.push(obj)

      return out(null, content)
    }
  }

  function out(err, result) {
    if (err) {
      if (callback) callback(err)
      else throw err
      return
    }

    if (callback) callback(null, result)
    else return result
  }
}

module.exports = readFileAndCache
module.exports.sync = readFileAndCacheSync
module.exports.readFileAndCacheSync = readFileAndCacheSync
