var phantom = require('phantom');

function Resource(site_url) {
  this.site_url = site_url;
}

Resource.prototype.fetchAll = function(callback) {
  // We'll be working with a new scope, so we won't be able to access
  // 'this'. We need to save 'this' as a variable
  var self = this;

  phantom.create(function (ph) {
    ph.createPage(function(page) {

      page.resources = [];

      // Each time a resource is requested, the onResourceRequested
      // callback is invoked. We then save each result to page.resources
      // object. The second argument is the callback that access our code's scope
      page.onResourceRequested(function() { },
                               function(req) {
        page.resources[req.id] = {
          request: req
        }
        console.log("resource loaded")
      })

      // Callback is invoked (second param) once phantom assumes 
      // site is finished loading
      page.open(self.site_url, function(status) {

        if (status !== 'success') {
          console.log("Failed to load");
          ph.exit(1);
        }
        else {
          // Site is finished loading
          json = self.createJson(page.resources);
          // console.log(JSON.stringify(json, undefined, 4))
          callback(json);
          ph.exit();
        }
      })

    })
  });
}

Resource.prototype.createJson = function(resources) {
  var entries = [];
  resources.forEach(function (resource) {

    var request = resource.request;

    // Ignore data urls
    if (request.url.match(/(^data:(font|image)\/.*)/i)) { return; }

    entries.push({
      time: request.time,
      url: request.url
    });

  })  
  return { items: entries }; 
};

module.exports = Resource;

