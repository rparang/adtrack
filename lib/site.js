var path = require('path');
var urlnode = require('url');
var Resource = require('./resource');
var Ad = require('./ad');

function Site() {
  this.name = 'gooz';
  this.url = 'http://iwillteachyoutoberich.com';
  this.test = this.parseAds();
}


Site.prototype.parseAds = function() {
  var self = this;
  var resource = new Resource(this.url);
  var ad = new Ad();

  resource.fetchAll(function(data) {
    var data = data['items'];
    for (var i = 0; i < data.length; i++) {
      // var url = data[i].url
      
      //Check to see if URL of resource is worth checking
      if (self.isUrlImportant(data[i].url) == true) {
        // console.log(url);

        (function(i){
          ad.fetchAll(function(gooz) {
            // console.log(data[i].url);
            var gooz = JSON.parse(gooz)['items'];
            for (var j = 0; j < gooz.length; j++) {
              // console.log(gooz[j]['pattern'])
              var regex = new RegExp(gooz[j]['pattern']);
              if (regex.test(urlnode.parse(data[i].url).host) == true) {
                console.log(gooz[j]['name'] + '\n' + gooz[j]['pattern'] + '\n' + data[i].url + '\n')
              };

            };
          });

        })(i);

      }

    };

  });
  
};

Site.prototype.isUrlImportant = function(resource_url) {
  var extname = path.extname(resource_url);
  return (!(extname == '.css' || extname == '.png' || extname == '.jpg')) ? true : false;
};

module.exports = Site;




