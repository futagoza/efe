/**
 * Required modules.
 */

var NFS = require('fs');
var FSE = require('fs-extra');
var PATH = require('path');
var chokidar = require('chokidar');
var glob = require('glob');
var Walker = require("walker");

/**
 * `efe`'s' module.exports is a shallow clone of `fs` and `fs-extra`
 */

var fs = exports = module.exports = {};
Object.keys(NFS).forEach(
  function ( key ) { fs[key] = NFS[key]; }
);
Object.keys(FSE).forEach(
  function ( key ) { fs[key] = FSE[key]; }
);

/**
 * Expose version of `efe`.
 */

fs.VERSION = require('./package.json').version;

/**
 * Ensure's forward slashs are used on Windows.
 */

var normalize = PATH.normalize;

fs.enableForwardSlashes = function ( ) {
  fs.normalize = PATH.normalize = function ( ) {
    return normalize.apply(PATH, arguments).replace('\\', '/');
  };
  return fs;
};

fs.disableForwardSlashes = function ( ) {
  fs.normalize = PATH.normalize = normalize;
  return fs;
};

/**
 * Remove `deprecated` warning when using `fs.exists(Sync)`.
 */

if ( fs.access && fs.accessSync ) {
  
  fs.exists = function ( path, callback ) {
    return fs.access(path, fs.F_OK, function(err){
      if ( err ) throw err;
      callback(err ? null : true);
    });
  };
  
  fs.existsSync = function ( path ) {
    return fs.accessSync(path, fs.F_OK) ? false : true;
  };
  
}

/**
 * Attach methods from other modules to `efe`.
 */

fs.normalize = PATH.normalize;
fs.join = PATH.join;
fs.resolve = PATH.resolve;
fs.isAbsolute = PATH.isAbsolute;
fs.relative = PATH.relative;
fs.dirname = PATH.dirname;
fs.basename = PATH.basename;
fs.extname = PATH.extname;
fs.sep = PATH.sep;
fs.delimiter = PATH.delimiter;
fs.parse = PATH.parse;
fs.format = PATH.format;
fs.Watcher = chokidar.FSWatcher;
fs.watch = chokidar.watch;
fs.hasMagic = glob.hasMagic;
fs.glob = glob;
fs.globSync = glob.sync;
fs.Glob = glob.Glob;
fs.writeFile = FSE.outputFile;
fs.writeFileSync = FSE.outputFileSync;
fs.Walker = Walker;

/**
 * Update the `stats` object returned by methods using `fs.Stats`.
 */

function modifyStatsObject ( stats, path ) {
  stats.path = path;
  stats.basename = fs.basename(path);
  stats.dirname = fs.dirname(path);
  stats.extname = fs.extname(path);
  return stats;
}

["stat", "lstat"/*, "fstat"*/].forEach(function(method){
  
  fs[method] = function ( path, callback ) {
    FSE[method](path, function(err, stats){
      callback(err, stats ? modifyStatsObject(stats, path) : stats);
    });
  };
  
  fs[method + 'Sync'] = function ( path ) {
    return modifyStatsObject(FSE[method + 'Sync'](path), path);
  };
  
});

/**
 * Walk the directory tree, firing `callback` on every item thats not a directory.
 * 
 * @param {String} path
 * @param {Function} callback
 */

fs.walk = function ( path, callback ) {
  fs.lstat(path, function(err, stats){
    if ( err ) {
      callback(err);
    } else {
      if ( stats.isDirectory() ) {
        fs.readdir(path, function(err, items){
          if ( err ) {
            callback(err);
          } else {
            items.forEach(function(item){
              fs.walk(fs.join(path, item), callback);
            });
          }
        });
      } else {
        callback(null, path, stats);
      }
    }
  });
};

fs.walkSync = function ( path, callback ) {
  var stats = fs.lstatSync(path);
  if ( stats.isDirectory() )
    fs.readdirSync(path).forEach(function(item){
      fs.walk(fs.join(path, item), callback);
    });
  else
    callback(path, stats);
};

/**
 * Check if the given path is of a spefic type.
 * 
 * Passing a callback will turn these methods into Async's,
 * but if there's no callback, these are just sync methods.
 * 
 * @param {String} path
 * @param {Function} callback (optional)
 * @return {Boolean|Null}
 */

[
  
  "isFile",
  "isDirectory",
  "isBlockDevice",
  "isCharacterDevice",
  "isSymbolicLink",
  "isFIFO",
  "isSocket"

].forEach(function(method){
  
  fs[method] = function ( path, callback ) {
    if ( arguments.length === 1 ) return FSE.lstatSync(path);
    FSE.lstat(path, function(err, stats){
      if ( err ) throw err;
      callback(stats ? stats[method]() : false);
    });
  };
  
});
