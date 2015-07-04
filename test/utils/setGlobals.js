var mock = require('mock-fs');
global.assert = require('assert');
global.fs = require('fs');
global.fse = require('fs-extra');
global.efe = require('../../');
global.path = require('path');

global.USE_MOCKFS = process.argv.indexOf('--use-mockfs') !== -1;
global.__fixtures__ = path.join(__dirname, '..', 'fixtures');

if ( USE_MOCKFS ) {

  var mockedFixtures = require('./mockedFixtures');

  Object.defineProperty(global, 'before', {
    configurable: true,
    set: function ( before ) {
      Object.defineProperty(global, 'before', {
        configurable: true,
        value: before
      });
      before(function(){
        mock(mockedFixtures);
      });
    }
  });

  Object.defineProperty(global, 'after', {
    configurable: true,
    set: function ( after ) {
      Object.defineProperty(global, 'after', {
        configurable: true,
        value: after
      });
      after(mock.restore);
    }
  });

}
