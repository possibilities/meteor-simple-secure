SimpleSecure = function() {
  this.writeDataMatch = /\/\w*\/(insert|update|remove)$/i;
  this.allMethodNames = ['insert', 'update', 'remove'];
};

SimpleSecure.prototype.noDataMagic = function() {
  this._loadExistingCollectionNames();
  this._buildBlacklist.apply(this, arguments);
  this._validateBlacklist();
  this._applyBlacklist();
};

SimpleSecure.prototype._applyBlacklist = function() {
  var self = this;
  _.each(Meteor.default_server.method_handlers, function(method, route) {
    var isDataRoute = self.writeDataMatch.test(route);
    if (isDataRoute) {
      // Figure out which collection and method we're talking about
      var routeParts = route.split('/');
      var collectionName = routeParts[1]; 
      var methodName = routeParts[2]; 
      var methodBlacklist = self.blacklist[collectionName];
      if (methodBlacklist && _.include(methodBlacklist, methodName)) {
        Meteor.default_server.method_handlers[route] = function() {
          var preposition = '';
          if (methodName == 'remove') preposition = 'from ';
          if (methodName == 'insert') preposition = 'into ';
          var message = "Data Access Error trying to " + methodName + " " + preposition + collectionName;
          throw new SimpleSecureError(methodName, collectionName);
        };
      }
    }
  });
};

SimpleSecure.prototype._loadExistingCollectionNames = function() {
  // TODO: lots of duplication in _applyBlacklist, can we do this once?
  var self = this;
  self.allCollectionNames = [];
  _.each(Meteor.default_server.method_handlers, function(method, route) {
    var isDataRoute = self.writeDataMatch.test(route);
    if (isDataRoute) {
      // Figure out which collection and method we're talking about
      var routeParts = route.split('/');
      var collectionName = routeParts[1]; 
      var methodName = routeParts[2];
      if (_.isUndefined(self.allCollectionNames[collectionName])) {
        self.allCollectionNames.push(collectionName);
      }
    }
  });
  self.allCollectionNames = _.uniq(self.allCollectionNames);
};

SimpleSecure.prototype._validateBlacklist = function() {
  var self = this;
  _.each(this.blacklist, function(methodNames, collectionName) {
    if (!_.contains(self.allCollectionNames, collectionName)) {
      throw new Error(collectionName + ' collection does not exist');
    }
    _.each(methodNames, function(methodName) {
      if (!_.include(self.allMethodNames, methodName)) {
        throw new Error(methodName + ' method does not exist');
      }
    });
  });
};

SimpleSecure.prototype._buildBlacklist = function() {
  var self = this;
  self.blacklist = {};
  var rawBlacklist = _.toArray(arguments);

  // If no arguments put everything on the blacklist
  if (_.isEmpty(rawBlacklist)) {
    rawBlacklist = _.clone(self.allCollectionNames);
  }

  // If passing in a single argument that's an array use it as the blacklist
  if (rawBlacklist.length === 1 && _.isArray(_.first(rawBlacklist))) {
    rawBlacklist = _.first(rawBlacklist)
  }

  // Massage the blacklist specification info
  _.each(rawBlacklist, function(blacklistItem) {

    // If it's a string build up an object
    if (_.isString(blacklistItem)) {
      self.blacklist[blacklistItem] = self.allMethodNames;

    // If it's an object spruce up the attrs
    } else if (_.isObject(blacklistItem)) {
      _.each(blacklistItem, function(methods, collectionName) {
        if (!methods) {
          methods = self.allMethodNames;
        }
        self.blacklist[collectionName] = _.isArray(methods) ? methods : [methods];
      });

    // If it's ready just add it
    } else {
      _.extend(self.blacklist, blacklistItem)
    }
  });
};

SimpleSecureError = function(methodName, collectionName) {
  var preposition = '';
  if (methodName == 'remove') preposition = 'from ';
  if (methodName == 'insert') preposition = 'into ';
  if (methodName == 'remove') methodName = 'delete';
  var message = "Data Access Error trying to " + methodName + " " + preposition + collectionName;
  Meteor.Error.call(this, 500, message);
};
SimpleSecureError.prototype = new Meteor.Error;

Secure = new SimpleSecure();
