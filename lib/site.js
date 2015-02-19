var path = require('path'),
    url = require('url'),
    Resource = require('./resource'),
    Ad = require('./ad');

function Site(options) {
  this.name = options.name;
  this.url = options.url;
  this.category = options.category;
  this.rank_for_category = options.rank_for_category;
  this.report = options.report;
}

// Get all site resources and see if each is an ad
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
            obj.push({
              name: ads[j]['name'],
              category: ads[j]['type'],
              url: resources[i].url
            });
          };
        };
      };
         
      self.createReport(self.name, self.url, obj, function(report) {
        callback(report);
      });

    })
  })
};

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

Site.prototype.createReport = function(site_name, site_url, ads, callback) {
  var report = {};

  report["total_count"] = 0;
  ads.forEach(function(ad) {
    report["total_count"] += 1;

    // Refactor to use hasOwnProperty
    if (!(ad.name in report)){
      report[ad.name] = {
        "count" : 0,
        "urls"  : [],
      };
    };
    report[ad.name]["count"] += 1;
    report[ad.name]["urls"].push(ad.url); 
  });

  callback(report);
};

Site.prototype.isUrlImportant = function(resource_url) {
  var resource_type = path.extname(resource_url);
  return (!(resource_type == '.css' || resource_type == '.png' || resource_type == '.jpg')) ? true : false;
};

Site.talk = function() { console.log('I am talking.'); };
module.exports = Site;

