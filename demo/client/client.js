// Data 

ReadOnlyData = new Meteor.Collection('readOnlyData');

// Subscriptions

Meteor.subscribe('readOnlyData');
Meteor.subscribe('code');

// Template methods

Template.simpleSecureDemo.readOnlyData = function () {
  return ReadOnlyData.find().fetch();
};

Template.simpleSecureDemo.demoLayout = function () {
  return Session.get('demoLayout');
};

Template.simpleSecureDemo.successMessage = function() {
  successFadeOutAfter(10000);
  return Session.get('successMessage');
};

// Events

Template.simpleSecureDemo.events = {
  'click input' : function (e) {
    Session.set('successMessage', "You should have seen the bits you deleted reappear quickly because Meteor resync's your local and remote data immediately when you delete it locally.")
    ReadOnlyData.remove({});
  }
};

// Animations

// TODO: This is kinda broken if you click your ass off on it
var successFadeOutAfter = function(afterSeconds) {
  if (this.timeoutId) Meteor.clearTimeout(this.timeoutId);
  this.timeoutId = Meteor.setTimeout(function() {
    Session.set('successMessage');
    $('#successMessage').fadeOut('fast');
  }, afterSeconds);
};
