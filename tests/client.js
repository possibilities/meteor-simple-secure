ReadOnlyData = new Meteor.Collection('readOnlyData');
ReadAndWriteData = new Meteor.Collection('readAndWriteData');

Meteor.subscribe('readOnlyData');
Meteor.subscribe('readAndWriteData');

// Helpers

var waitForNRecords = function(recordFinder, nRecords, fn) {
  var records;
  var intervalId = Meteor.setInterval(function() {
    recordFinder.rewind();
    records = recordFinder.fetch();
    if (records.length === nRecords) {
      Meteor.clearInterval(intervalId);
      fn(records);
    }
  }, 50);
};

// Tests

testAsyncMulti("simple-secure - read only - attempt update", [
  function(test, expect) {
    
    // Make sure the collection doesn't get updated
    var ensureRecordDidNotUpdate = expect(function(err, readOnlyData) {
      test.isFalse(err);
      test.isTrue(_.isUndefined(_.first(readOnlyData).hacked));
    });
    var ensureCollectionNotUpdatable = expect(function(records) {
      var record = _.first(records);
      ReadOnlyData.update(record, { $set: { hacked: 1 } });
      Meteor.call('getReadOnlyData', ensureRecordDidNotUpdate);
    });
    waitForNRecords(ReadOnlyData.find(), 3, ensureCollectionNotUpdatable);
    
    // Make sure an error get's thrown when trying to update collection
    var ensureCollectionUpdateThrowsError = expect(function(records) {
      var record = _.first(records);
      ReadOnlyData.update(record, { $set: { hacked: 1 } }, function(err, result) {
        test.equal(err.error, 500);
        test.equal(err.reason, "Data Access Error trying to update readOnlyData");
      });
    });
    waitForNRecords(ReadOnlyData.find(), 3, ensureCollectionUpdateThrowsError);
  }
]);

testAsyncMulti("simple-secure - read only - attempt insert", [
  function(test, expect) {
    
    // Make sure the collection doesn't grow when we insert into it
    var ensureRecordDidNotInsert = expect(function(err, readOnlyData) {
      test.isFalse(err);
      test.equal(readOnlyData.length, 3);
    });
    var ensureCollectionNotInsertable = expect(function(records) {
      ReadOnlyData.insert({ hacked: 1 });
      Meteor.call('getReadOnlyData', ensureRecordDidNotInsert);
    });
    waitForNRecords(ReadOnlyData.find(), 3, ensureCollectionNotInsertable);
      
    // Make sure an error get's thrown when trying to insert into a collection
    var ensureCollectionInsertThrowsAppropriateError = expect(function(err, result) {
      test.equal(err.error, 500);
      test.equal(err.reason, "Data Access Error trying to insert into readOnlyData");
    });
    var ensureCollectionInsertThrowsError = expect(function(records) {
      ReadOnlyData.insert({ hacked: 1 }, ensureCollectionInsertThrowsAppropriateError);
    });
    waitForNRecords(ReadOnlyData.find(), 3, ensureCollectionInsertThrowsError);
  }
]);

testAsyncMulti("simple-secure - read only - attempt remove", [
  function(test, expect) {

    // Make sure the collection doesn't shrink when we remove from it
    var ensureCollectionNotRemovable = expect(function(records) {
      var record = _.first(records);
      ReadOnlyData.remove(record);
      Meteor.call('getReadOnlyData', function(err, readOnlyData) {
        test.isFalse(err);
        test.equal(readOnlyData.length, 3);
      });
    });
    waitForNRecords(ReadOnlyData.find(), 3, ensureCollectionNotRemovable);

    // Make sure an error get's thrown when trying to insert into a collection
    var ensureCollectionRemoveThrowsAppropriateError = expect(function(err, result) {
      test.equal(err.error, 500);
      test.equal(err.reason, "Data Access Error trying to delete from readOnlyData");
    });
    var ensureCollectionRemoveThrowsError = expect(function(records) {
      var record = _.first(records);
      ReadOnlyData.remove(record, ensureCollectionRemoveThrowsAppropriateError);
    });
    waitForNRecords(ReadOnlyData.find(), 3, ensureCollectionRemoveThrowsError);
  }
]);

// No need to try every possible combination, in the following tests we just check that some
// only one method that's specified as restricted and one that's not

testAsyncMulti("simple-secure - mixed access - attempt insert", [
  function(test, expect) {
    // Make sure the collection grows when we insert into it
    var recordId;
    var ensureRecordInsert = expect(function(err, readAndWriteData) {
      test.isFalse(err);
      test.equal(readAndWriteData.length, 4);
      // Remove it because we need to get the collection
      Meteor.call('removeFromReadAndWriteData', recordId, ensureRecordInsert);
    });
    var ensureCollectionInsertable = expect(function(records) {
      recordId = ReadAndWriteData.insert({ hacked: 2 });
      Meteor.call('getReadAndWriteData', ensureRecordInsert);
    });
    waitForNRecords(ReadAndWriteData.find(), 3, ensureCollectionInsertable);
  }
  
]);

testAsyncMulti("simple-secure - mixed access - attempt remove", [
  function(test, expect) {
    // Make sure the collection doesn't shrink when we remove from it
    var ensureRecordDidNotRemove = expect(function(err, readAndWriteData) {
      test.isFalse(err);
      test.equal(readAndWriteData.length, 3);
    });
    var ensureCollectionNotRemoveable = expect(function(records) {
      var record = _.first(records);
      ReadAndWriteData.remove(record);
      Meteor.call('getReadAndWriteData', ensureRecordDidNotRemove);
    });
    waitForNRecords(ReadAndWriteData.find(), 3, ensureCollectionNotRemoveable);
  }
]);
