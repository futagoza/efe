describe('fs-integration:', function(){

  it('should use native fs methods', function(){
    var filename = path.join(__fixtures__, 'temp.txt');
    efe.writeFileSync(filename, 'hello');
    assert.equal(efe.readFileSync(filename, 'utf8'), 'hello');
  });

  // Node.js v0.12 / IO.js
  if ( 'F_OK' in fs ) {
    it('should have native fs constants', function(){
      assert.equal(efe.F_OK, fs.F_OK);
      assert.equal(efe.R_OK, fs.R_OK);
      assert.equal(efe.W_OK, fs.W_OK);
      assert.equal(efe.X_OK, fs.X_OK);
    });
  }

});
