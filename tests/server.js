Tinytest.add("simple-secure - specifying access", function (test) {
  var expected;
  
  // Should include all the collections if there's no arguments
  // Unfort we can't really call the constructor in the test suite
  // because it breaks the test runner itself (;
  var SecureDouble = new SimpleSecure();
  SecureDouble._loadExistingCollectionNames.call(SecureDouble);
  SecureDouble._buildBlacklist.call(SecureDouble);
  test.isTrue(_.isObject(SecureDouble.blacklist));
  test.isTrue(_.size(SecureDouble.blacklist) > 5);
  
  // Should merge all given objects into one
  Secure.noDataMagic({
    aCollection: [ 'insert', 'update', 'remove' ]
  }, {
    anotherCollection: [ 'insert', 'update', 'remove' ]
  });
  expected = {
    aCollection: [ 'insert', 'update', 'remove' ],
    anotherCollection: [ 'insert', 'update', 'remove' ]
  };
  test.equal(Secure.blacklist, expected);
  
  // Should translate a string argument (representing the name of a collection) into an object with the string
  // as a key to a method blacklist for the collection including all three magic methods (i.e. insert, remove, update).
  Secure.noDataMagic('aCollection');
  expected = {
    aCollection: [ 'insert', 'update', 'remove' ]
  };
  test.equal(Secure.blacklist, expected);
  
  // Should allow mixing and matching declaration types
  Secure.noDataMagic('aCollection', {
    anotherCollection: [ 'insert' ],
    yetAnotherCollection: [ 'insert' ]
  }
  );
  expected = {
      aCollection: [ 'insert', 'update', 'remove' ],
      anotherCollection: [ 'insert' ],
      yetAnotherCollection: [ 'insert' ]
  };
  test.equal(Secure.blacklist, expected);
  
  // Should make the method blacklist into an array if the it's a string
  Secure.noDataMagic({ 'aCollection': 'insert' });
  expected = {
    aCollection: [ 'insert' ]
  };
  test.equal(Secure.blacklist, expected);
  
  // Should throw an error if you specify a collection that doesn't exist
  test.throws(function(e) {
    Secure.noDataMagic('aNonExistentCollection');
  });
  // Should throw an error if you specify a method that doesn't exist
  test.throws(function(e) {
    Secure.noDataMagic({ aNonExistentCollection: ['kiss'] });
  });
});
