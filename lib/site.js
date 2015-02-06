var path = require('path');
var url = require('url');
var Resource = require('./resource');
var Ad = require('./ad');

function Site(name, url) {
  this.name = name;
  this.url = url;
}

// testing gooz comment here

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
        if (self.isUrlImportant(resources[i].url) == false ) { console.log("not important", resources[i].url); continue; }
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
    
      // callback(gooz);

      self.createReport(self.name, self.url, obj, function(report) {
        callback(report);
      })

    })
  })
};

Site.prototype.createReport = function(site_name, site_url, ads, callback) {
  // var gooz = [];
  var gooz = {};

  var dict = {};

  dict["total_count"] = 0;
  ads.forEach(function(ad) {
    dict["total_count"] += 1;
    if (!(ad.name in dict)){
      dict[ad.name] = {
        "count" : 0,
        "urls"  : [],
      };
    };
    dict[ad.name]["count"] += 1;
    dict[ad.name]["urls"].push(ad.url); 
  });

  // console.log("info doe", dict);

  // ads.forEach(function(ad) {
  //   console.log("my nigga up here", ad.name);
  //   // gooz[ad['name']] = { 
  //   //   category: ad['category'],
  //   //   url: ad['url']
  //   // }

    // gooz[ad['name']] = ad['url']
    
  // })
  // console.log(gooz, gooz.length)
  // var array = [];
  // array.push(gooz)
  // var report = {
  //   name: site_name,
  //   url: site_url,
  //   ad_count: gooz.length,
  //   ads: gooz
  // }

  callback(dict);
};


Site.prototype.isUrlImportant = function(resource_url) {
  var resource_type = path.extname(resource_url);
  return (!(resource_type == '.css' || resource_type == '.png' || resource_type == '.jpg')) ? true : false;
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



