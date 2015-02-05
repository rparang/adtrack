var request = require('request'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    url_node = require('url');

var url = 'http://www.alexa.com/topsites/category/Top/',
    results = [];

_init();

function _init () {
  request(url, getCategories);
}

function getCategories(error, response, body) {
  if (!error && response.statusCode == 200) {
    var $ = cheerio.load(body);
    $('div.categories').find('a').each(function(i, element) {
      var category = $(this),
          category_url = category.attr('href');

      if (!(category_url == '/topsites/category/Top/Adult' || category_url == '/topsites/category/Top/Regional'  )) {
        request('http://www.alexa.com' + category_url, getSites)
      };
    });
  }
}

function getSites (error, response, body) {
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
        "name": name,
        "url": url,
        "category": category,
        "rank_for_category": rank_for_category,
        "report": report
      };
      results.push(meta);
    })
    saveSites(results);
  }
}

function saveSites(sites) {
  fs.writeFile("./alexa_sites.json", JSON.stringify(sites), function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("Sites saved!");
    }
  }); 
}