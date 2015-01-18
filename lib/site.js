var path = require('path');
var url = require('url');
var Resource = require('./resource');
var Ad = require('./ad');

function Site() {
  this.name = 'gooz';
  this.url = 'http://www.homedepot.com';
  this.test = this.gooz();
}


Site.prototype.parseAds = function(callback) {
  var self = this;
  var resource = new Resource(this.url);
  var ad = new Ad();

  resource.fetchAll(function(data) {
    var data = data['items'];
    for (var i = 0; i < data.length; i++) {
      
      if (self.isUrlImportant(data[i].url) == true) {

        (function(i){
          ad.fetchAll(function(ads) {
            var ads = JSON.parse(ads)['items'];
            for (var j = 0; j < ads.length; j++) {
              var regex = new RegExp(ads[j]['pattern']);
              if (regex.test(url.parse(data[i].url).host) == true) {
                console.log(ads[j]['name'] + '\n' + ads[j]['pattern'] + '\n' + ads[j]['type'] + '\n' + data[i].url + '\n');
              };

            };
          });

        })(i);

      }

    };
  });
  callback();
};

Site.prototype.isUrlImportant = function(resource_url) {
  var resource_type = path.extname(resource_url);
  return (!(resource_type == '.css' || resource_type == '.png' || resource_type == '.jpg')) ? true : false;
};

Site.prototype.gooz = function() {
  this.parseAds(function() { console.log("GOOZIE") });
};


module.exports = Site;




