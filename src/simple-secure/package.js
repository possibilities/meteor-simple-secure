Package.describe({
  summary: "A simple smart package for turning off Meteor's automatically generated Mongo accessors"
});

Package.on_use(function (api) {
  api.use('underscore', 'server');
  api.use('livedata', 'client');

  api.add_files('client.js', 'client');
  api.add_files('server.js', 'server');
});

Package.on_test(function (api) {
  api.use('test-helpers', ['client', 'server']);

  api.add_files('tests/setup.js', 'server');
  api.add_files('tests/client.js', 'client');
  api.add_files('tests/server.js', 'server');
});
