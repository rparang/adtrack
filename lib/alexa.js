var request = require('request'),
    cheerio = require('cheerio'),
    url_node = require('url'),
    change_case = require('change-case'),
    utils = require('./utils');

function Alexa() {}

// Populate a file for each Alexa top site
Alexa.populateReportFiles = function(callback) {
  var self = this;

  this.getAlexaCategories(function(categories) {
    categories.forEach(function(category, i) {
      self.getAlexaTopSitesByCategory(category, function(top_sites) {
        top_sites.forEach(function(top_site, i) {
          utils.writeFile(top_site['name'], top_site, function() {console.log(top_site['name'] + ' saved!')})
        })
      })
    })
  })
};

// Call Alexa for top categories
Alexa.getAlexaCategories = function (callback) {
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
Alexa.getAlexaTopSitesByCategory = function(alexa_category_url, callback) {
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

module.exports = Alexa;
