ReadMe2Demo = function() {
};

ReadMe2Demo.prototype.parse = function(fn) {
  Meteor.http.get('README.md', function(err, readMe) {
    
    var htmlParts = readMe.content.split('## Demo');
    var header = _.first(htmlParts) + '## Demo';
    var rawBottom = _.last(htmlParts);
    var footerParts = rawBottom.split('##');
    footerParts.shift();
    var footer = '##' + footerParts.join('##');
    
    fn({header: header, footer: footer});
  });
};

new ReadMe2Demo().parse(function(demoLayout) {
  Session.set('demoLayout', demoLayout);
});
