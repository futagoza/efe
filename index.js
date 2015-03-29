/**
 * Required modules.
 */

var FS = require('fs-extra');
var PATH = require('path');
var chokidar = require('chokidar');
var glob = require('glob');
var Walker = require("walker");

/**
 * `efe`'s' module.exports is a shallow clone of `fs-extra`
 */

var fs = exports = module.exports = {};
Object.keys(FS).forEach(
  function ( key ) { fs[key] = FS[key]; }
);

/**
 * This should ensure that only forward slashs are used, even on Windows.
 */

var normalize = PATH.normalize;

fs.enableForwardOnly = function ( ) {
  fs.normalize = PATH.normalize = function ( ) {
    return normalize.apply(PATH, arguments).replace('\\', '/');
  };
  return fs;
};

fs.disableForwardOnly = function ( ) {
  fs.normalize = PATH.normalize = normalize;
  return fs;
};

/**
 * Remove's `deprecated` warning when using `fs.existsSync`.
 */

if ( fs.access && fs.accessSync ) {
  
  fs.exists = function ( path, callback ) {
    return fs.access(path, fs.F_OK, callback);
  };
  
  fs.existsSync = function ( path ) {
    return fs.accessSync(path, fs.F_OK);
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
fs.glob = glob;
fs.writeFile = FS.outputFile;
fs.writeFileSync = FS.outputFileSync;
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
    FS[method](path, function(err, stats){
      callback(err, stats ? modifyStatsObject(stats, path) : stats);
    });
  };
  
  fs[method + 'Sync'] = function ( path ) {
    return modifyStatsObject(FS[method + 'Sync'](path), path);
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
