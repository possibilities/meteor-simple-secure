// Setup datasource

ReadOnlyData = new Meteor.Collection('readOnlyData');

// Publish some data

Meteor.publish('readOnlyData', function () {
  return ReadOnlyData.find();
});

// Secure data

Secure.noDataMagic('readOnlyData');

// Setup demo data

ReadOnlyData.remove({});
ReadOnlyData.insert({ tidbit: 'Read Only Foo' });
ReadOnlyData.insert({ tidbit: 'Read Only Bar' });
ReadOnlyData.insert({ tidbit: 'Read Only Moof' });
