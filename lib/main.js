var Site = require('./site')

var site = new Site("Stackoverflow", 'http://www.homedepot.com');
// var ads = site.test;

site.parseAdsFromResources(function(new_obj) {console.log(new_obj)});