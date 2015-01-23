var path = require('path');
var url = require('url');
var Resource = require('./resource');
var Ad = require('./ad');

function Site(name, url) {
  this.name = name;
  this.url = url;
}

Site.prototype.getResources = function(callback) {
  var resource = new Resource(this.url);
  resource.fetchAll(function(data) {
    var resources = data['items'];
    callback(resources);
  })
};

Site.prototype.getAds = function(callback) {
  var ad = new Ad();
  ad.fetchAll(function(data) {
    ads = JSON.parse(data)['items'];
    callback(ads);
  })
};

Site.prototype.parseAdsFromResources = function(callback) {
  var self = this;
  var obj = [];

  this.getResources(function(resources) {
    Site.prototype.getAds(function(ads) {

      // Expensive operation O(n^2). Blocks event loop because
      // both resources and ads are loaded into memory
      for (var i = 0; i < resources.length; i++) {
        for (var j = 0; j < ads.length; j++) {
          var regex = new RegExp(ads[j]['pattern']);
          if (regex.test(url.parse(resources[i].url).host) == true) {
            // console.log(ads[j]['name'] + '\n' + ads[j]['pattern'] + '\n' + ads[j]['type'] + '\n' + resources[i].url + '\n');
            obj.push({
              name: ads[j]['name'],
              category: ads[j]['type'],
              url: resources[i].url
            });
          };
        };
      };

      var gooz = {
        name: self.name,
        url: self.url,
        ad_count: obj.length,
        ads: obj
      };

      callback(gooz);
    })
  })
};

module.exports = Site;

// Site.prototype.getTrackers = function(callback) {
//   // var self = this;
//   var resource = new Resource(this.url);

//   resource.fetchAll( this.parseResources );
//   callback();
// };

// Site.prototype.parseResources = function(data) { //make (resource)
//   var ad = new Ad();
//   var data = data['items'];
//   for (var i = 0; i < data.length; i++) {
//     if (Site.isUrlImportant(data[i].url) == true) {
//       (function(i){
//         ad.fetchAll(function(ads) {
//           var ads = JSON.parse(ads)['items'];
//           for (var j = 0; j < ads.length; j++) {
//             var regex = new RegExp(ads[j]['pattern']);
//             if (regex.test(url.parse(data[i].url).host) == true) {
//               console.log(ads[j]['name'] + '\n' + ads[j]['pattern'] + '\n' + ads[j]['type'] + '\n' + data[i].url + '\n');
//             };

//           };
//         });

//       })(i);

//     }
//   };
// };

// Site.prototype.gooz = function() {
//   this.getTrackers(function() { console.log("GOOZIE") });
// };

// // Refactor
// Site.isUrlImportant = function(resource_url) {
//   var resource_type = path.extname(resource_url);
//   return (!(resource_type == '.css' || resource_type == '.png' || resource_type == '.jpg')) ? true : false;
// };

