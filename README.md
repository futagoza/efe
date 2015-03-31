An enhanced version of [fs-extra](https://github.com/jprichardson/node-fs-extra)<br>

# note
All properties from 'fs' and methods from 'fs-extra' are shallow cloned when this module is required for the first time, which means extending this modules exports will not affect either of those modules.

# install
  
```shell
npm install efe --save
```

# api usage
  
```js
var efe = require('efe');

// Ensure's forward slashs are used on Windows
fs.enableForwardSlashes();
fs.disableForwardSlashes();
fs.resetNormalize();

// Removed `deprecated` warning when using `fs.exists(Sync)`
fs.exists(path, callback);
fs.existsSync(path);

// Attached methods from other modules to `efe`
fs.normalize(p);
fs.join([path1][, path2][, ...]);
fs.resolve([from ...], to);
fs.isAbsolute(path);
fs.relative(from, to);
fs.dirname(p);
fs.basename(p[, ext]);
fs.extname(p);
fs.sep
fs.delimiter
fs.parse(pathString);
fs.format(pathObject);
fs.Watcher(options);
fs.watch(paths, options);
fs.hasMagic(pattern, [options]);
fs.glob(pattern, [options], cb);
fs.sync(pattern, [options]);
fs.Glob(pattern, [options], [cb]);
fs.writeFile(filename, data[, options], callback);
fs.writeFileSync(filename, data[, options]);
fs.Walker(root);

// Updated the `stats` objects returned by methods using `fs.Stats`
fs.stat(path, callback);
fs.lstat(path, callback);
fs.statSync(path);
fs.lstatSync(path);

// Walk directory tree, firing `callback` on every item not a directory
fs.walk(path, callback);
fs.walkSync(path, callback);

// Check if the given path is of a spefic type
fs.isFile(path, [callback])
fs.isDirectory(path, [callback])
fs.isBlockDevice(path, [callback])
fs.isCharacterDevice(path, [callback])
fs.isSymbolicLink(path, [callback])
fs.isFIFO(path, [callback])
fs.isSocket(path, [callback])

// Return total size of the given path
fs.size(path, [options], [callback])
fs.sizeSync(path, [options])
```

# dependencies
  
  * fs-extra: [https://github.com/jprichardson/node-fs-extra](https://github.com/jprichardson/node-fs-extra)
  * chokidar: [https://github.com/paulmillr/chokidar](https://github.com/paulmillr/chokidar)
  * glob: [https://github.com/isaacs/node-glob](https://github.com/isaacs/node-glob)
  * walker: [https://github.com/daaku/nodejs-walker](https://github.com/daaku/nodejs-walker)
  * filesize: [https://github.com/avoidwork/filesize.js](https://github.com/avoidwork/filesize.js)

# license
Copyright (c) 2015 [Futago-za Ryuu](https://github.com/futagoza).<br>
Released under the [MIT License](http://opensource.org/licenses/MIT)
