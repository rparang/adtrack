var fs = require('fs');

function readAlexaSites(callback) {
  fs.readFile('../alexa/alexa_sites.json', 'utf8', function (err, data) {
    if (err) {
     return console.log(err);
    }
    callback(data);
  });
}

function writeFile (obj, callback) {
  fs.writeFile("./sites/"+obj['name']+".json", JSON.stringify(obj), function(err) {
    if(err) {
      console.log(err);
    }
  });
  callback();
}

function createAlexaSitesFiles() {
  readAlexaSites(function(data) {
    var sites = JSON.parse(data);
    sites.forEach(function(element, i) {
      writeFile(element, function() {console.log('saved...')} )
    })
  })
}

createAlexaSitesFiles();