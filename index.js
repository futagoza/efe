/**
 * Required modules.
 */

var FS = require('fs-extra');
var PATH = require('path');
var chokidar = require('chokidar');
var glob = require('glob');
var Walker = require("walker");
var filesize = require("filesize");

/**
 * The default export is just a shorthand for `fs.enableForwardSlashes()`
 */

var fs = module.exports = function ( ) {
  return fs.enableForwardSlashes();
};

/**
 * Shallow clone of `fs-extra` to `efe`
 */

Object.keys(FS).forEach(
  function ( key ) { fs[key] = FS[key]; }
);

/**
 * Expose version of `efe`.
 */

fs.VERSION = require('./package.json').version;

/**
 * Ensures forward slashes are used on Windows.
 */

var normalize = PATH.normalize;
var resolve = PATH.resolve;

fs.enableForwardSlashes = function ( ) {
  if ( PATH.sep === '\\' ) {
    fs.normalize = PATH.normalize = function ( ) {
      return normalize.apply(PATH, arguments).replace('\\', '/');
    };
    fs.resolve = PATH.resolve = function ( ) {
      return resolve.apply(PATH, arguments).replace('\\', '/');
    };
  }
  return fs;
};

fs.disableForwardSlashes = function ( ) {
  fs.normalize = PATH.normalize = normalize;
  fs.resolve = PATH.resolve = resolve;
  return fs;
};

fs.resetNormalize = fs.disableForwardSlashes;

/**
 * Remove `deprecated` warning when using `fs.exists(Sync)`.
 */

if ( fs.access && fs.accessSync ) {
  
  fs.exists = function ( path, callback ) {
    fs.access(path, fs.F_OK, function(err){
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
fs.resolve = PATH.resolve;
fs.join = PATH.join;
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

["stat", "lstat", "fstat"].forEach(function(method){
  
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
 * Walk the directory tree, firing `callback` on every item that's not a directory.
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
      fs.walkSync(fs.join(path, item), callback);
    });
  else
    callback(path, stats);
};

/**
 * Check if the given path is of a specific type.
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
    if ( arguments.length === 1 ) {
      return FS.lstatSync(path)[method]();
    }
    FS.lstat(path, function(err, stats){
      if ( err ) throw err;
      callback(stats ? stats[method]() : false);
    });
  };
  
  fs[method + 'Sync'] = function ( path ) {
    return FS.lstatSync(path)[method]();
  };
  
});

/**
 * Some aliases for path checking methods.
 */

fs.isBlock = fs.isBlockDevice;
fs.isBlockSync = fs.isBlockDeviceSync;
fs.isCharacter = fs.isCharacterDevice;
fs.isCharacterSync = fs.isCharacterDeviceSync;
fs.isSymbolic = fs.isSymbolicLink;
fs.isSymbolicSync = fs.isSymbolicLinkSync;
fs.isLink = fs.isSymbolicLink;
fs.isLinkSync = fs.isSymbolicLinkSync;

/**
 * Return total size of the given path.
 * 
 * @param {String} path
 * @param {Object} options (optional)
 * @param {Function} callback (optional)
 * @return {Number|Null}
 */

fs.size = function ( path, options, callback ) {
  if ( arguments.length === 2 ) {
    if ( typeof options === 'function' ) {
      callback = options;
      options = null;
    }
  }
  if ( typeof callback === 'function' ) {
    var size = 0;
    Walker(path)
      .on('entry', function(entry, stat){
        size += stat.size;
      })
      .on('error', function(er, entry, stat){
        callback(er, size, entry, stat);
      })
      .on('end', function(){
        if ( size && options ) {
          size = filesize(size, options);
        }
        callback(null, size);
      });
  } else {
    return fs.sizeSync(path, options);
  }
};

fs.sizeSync = function ( path, options ) {
  var size = 0;
  if ( fs.isDirectory(path) ) {
    fs.walkSync(path, function(path, stats){
      size += stats.size;
    });
  } else {
    size = FS.lstatSync(path).size;
  }
  return options ? filesize(size, options) : size;
};
