var Mocha = require('mocha');
var walk = require('walker');

global.mocha = new Mocha({
  ui: 'bdd',
  reporter: 'list',
  timeout: 25000
});

walk(__dirname)
  .on('entry', function(entry, stat){
    if ( stat.isFile() ) {
      if ( entry.slice(-8) === '.test.js' ) mocha.addFile(entry)
    }
  })
  .on('error', function(er){
    console.error(er);
    process.exit(1);
  })
  .on('end', function(){
    require("./utils/setGlobals");
    mocha.run(process.exit);
  });
