ReadOnlyData = new Meteor.Collection('readOnlyData');
ReadAndWriteData = new Meteor.Collection('readAndWriteData');
ACollection = new Meteor.Collection('aCollection');
AnotherCollection = new Meteor.Collection('anotherCollection');
YetAnotherCollection = new Meteor.Collection('yetAnotherCollection');

Secure.noDataMagic('readOnlyData', { readAndWriteData: 'remove' });

ReadOnlyData.remove({});
ReadOnlyData.insert({ tidbit: 'Read Only Foo' });
ReadOnlyData.insert({ tidbit: 'Read Only Bar' });
ReadOnlyData.insert({ tidbit: 'Read Only Moof' });

ReadAndWriteData.remove({});
ReadAndWriteData.insert({ tidbit: 'Read and Write Foo' });
ReadAndWriteData.insert({ tidbit: 'Read and Write Bar' });
ReadAndWriteData.insert({ tidbit: 'Read and Write Moof' });

Meteor.publish('readOnlyData', function () {
  return ReadOnlyData.find();
});

Meteor.publish('readAndWriteData', function () {
  return ReadAndWriteData.find();
});

Meteor.methods({
  getReadOnlyData: function() {
    return ReadOnlyData.find().fetch();
  },
  getReadAndWriteData: function() {
    return ReadAndWriteData.find().fetch();
  },
  removeFromReadAndWriteData: function(recordId) {
    ReadAndWriteData.remove(recordId);
  }
});
