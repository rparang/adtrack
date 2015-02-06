var path = require('path'),
    url = require('url'),
    request = require('request'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    url_node = require('url'),
    change_case = require('change-case'),
    Resource = require('./resource'),
    Ad = require('./ad');

var DIR = '../reports/';

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

// Populate a file for each Alexa top site
Site.prototype.populateReportFiles = function() {
  var self = this;

  this.getAlexaCategories(function(categories) {
    categories.forEach(function(category, i) {
      self.getAlexaTopSitesByCategory(category, function(top_sites) {
        top_sites.forEach(function(top_site, i) {
          self.writeFile(top_site, function() { console.log("File saved!")})
        })
      })
    })
  })
};

// Write a report file in DIR
Site.prototype.writeFile = function(obj, callback) {
  fs.writeFile(DIR + obj['name'] + ".json", JSON.stringify(obj), function(err) {
    if(err) {
      console.log(err);
    }
  });
  callback();
}

// Call Alexa for top categories
Site.prototype.getAlexaCategories = function (callback) {
  var categories = [];

  request('http://www.alexa.com/topsites/category/Top/', function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(body);
      $('div.categories').find('a').each(function(i, element) {
        var category = $(this),
            category_url = category.attr('href');

        if (!(category_url == '/topsites/category/Top/Adult' || category_url == '/topsites/category/Top/Regional' )) {
          categories.push(category_url);
        };
      });
      callback(categories);
    }
  })
}

// Call Alexa given a category to get top 25 sites
Site.prototype.getAlexaTopSitesByCategory = function(alexa_category_url, callback) {
  var alexa_site_results = [];

  request('http://www.alexa.com' + alexa_category_url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(body),
          category = $('span.page-title-text').children().eq(2).text();

      $('li.site-listing').each(function(i, element) {
        var site = $(this),
            name = site.find('p.desc-paragraph').children().text(),
            url = (url_node.parse(name).host == null) ? 'http://www.' + name : name,
            rank_for_category = site.find('div.count').text(),
            report = new Object()

        var meta = {
          "name": change_case.snakeCase(name),
          "url": change_case.lowerCase(url),
          "category": category,
          "rank_for_category": rank_for_category,
          "report": report
        };
        alexa_site_results.push(meta);
      })
      callback(alexa_site_results);
    }
  })
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

Site.prototype.createReport = function(site_name, site_url, ads, callback) {
  var report = {};

  report["total_count"] = 0;
  ads.forEach(function(ad) {
    report["total_count"] += 1;
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

module.exports = Site;

