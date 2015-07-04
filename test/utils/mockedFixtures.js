function mockedItem ( path, stat ) {
  var data = {
    mode: stat.mode,
    uid: stat.uid,
    gid: stat.gid,
    atime: stat.atime,
    ctime: stat.ctime,
    mtime: stat.mtime,
    birthtime: stat.birthtime
  };
  if ( stat.isDirectory() ) {
    data.items = buildMockDir(path);
  } else {
    data.content = fs.readFileSync(path);
  }
  return data;
}

function buildMockDir ( dir ) {
  var items = {};
  fs.readdirSync(dir).forEach(function(item){
    var entry = path.join(dir, item);
    items[item] = mockedItem(entry, fs.lstatSync(entry));
  });
  return items;
}

module.exports = {
  fixtures: buildMockDir(__fixtures__)
};
