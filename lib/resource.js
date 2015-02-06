var phantom = require('phantom');

function Resource(site_url) {
  this.site_url = site_url;
}

Resource.prototype.fetchAll = function(callback) {
  var self = this;

  console.log("\nFetching " + self.site_url);

  phantom.create(function (ph) {
    ph.createPage(function(page) {

      page.resources = [];
      page.set('settings.resourceTimeout', 1500);
      // page.set('viewportSize', { width: 1024, height: 768 });
      page.set('settings.userAgent', 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:25.0) Gecko/20100101 Firefox/29.0');

      page.set('onResourceTimeout', function(error) {
        console.log(error)
        page.resources[error.id] = {
          request: error
        }
      })

      page.get('settings', function(data){
        // console.log(data);
      })

      // Each time a resource is requested, the onResourceRequested
      // callback is invoked. We then save each result to page.resources
      // object. The second argument is the callback that access our code's scope
      page.onResourceRequested(function(requestData, request) 
        {
          if ((/http:\/\/.+?\.(css|jpg|png)/gi).test(requestData['url'])) {
            console.log('The url of the request is matching. Aborting: ' + requestData['url']);
            request.abort();
          }
        },
        function(req) {
          page.resources[req.id] = {
            request: req
          }
          console.log(req.id);
        }
      )

      // Callback is invoked (second param) once phantom assumes 
      // site is finished loading
      page.open(self.site_url, function(status) {
        if (status !== 'success') {
          console.log("Failed to load");
          ph.exit(1);
        }
        // Site is finished loading
        else {
          json = self.createJson(page.resources);
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
