var Site = require('./site'),
    fs = require('fs'),
    dir = '../data/sites/'

function getDirectory (callback) {
  fs.readdir(dir, function(err, files){
    if (err) {
     return console.log(err);
    }
    callback(files)
  })
}


function writeFile (obj, callback) {
  fs.writeFile(dir+obj['name']+".json", JSON.stringify(obj), function(err) {
    if(err) {
      console.log(err);
    }
  });
  callback();
}


getDirectory(function(data) {
  var sites = data;
  sites.forEach(function(element, i) {

    var site = readFile(element, function(data) {
      var data = JSON.parse(data);

      if (Object.keys(data['report']).length === 0) {
        console.log('gooz')
      };
      // var site = new Site(element['name'], element['url']);
      
    })

  })
});

function readFile(name, callback) {
  fs.readFile(dir + name, 'utf8', function (err, data) {
    if (err) {
     return console.log(err);
    }
    callback(data);
  });
}