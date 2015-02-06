var Site = require('./site'),
    fs = require('fs'),
    DIR = '../reports/',
    merge = require('merge');

function Adtrack(options) {
  this.options = options;
}

Adtrack.prototype.getReports = function(callback) {
  fs.readdir(DIR, function(err, reports){
    if (err) {
     return console.log(err);
    }
    callback(reports)
  })
};

Adtrack.prototype.readFile = function(name, callback) {
  fs.readFile(DIR + name, 'utf8', function (err, data) {
    if (err) {
     return console.log(err);
    }
    callback(data);
  });
}

var adtrack = new Adtrack({});
adtrack.getReports(function(reports) {

  Adtrack.prototype.callNextSite(reports.length - 1, reports)

})


Adtrack.prototype.callNextSite = function(index, sites) {
  var self = this;
  if (index == 0) return;

  this.readFile(sites[index], function(file) {
    var file = JSON.parse(file);

    // If report is empty, get new report
    if (Object.keys(file['report']).length === 0) {
      var site_report = new Site(file);
      site_report.parseAdsFromResources(function(report) {
        var obj_report = { report: report }

        var obj = merge({'name': site_report.name, 
                         'url': site_report.url,
                         'category': site_report.category,
                         'rank_for_category': site_report.rank_for_category,
                         'report': site_report.report
                        }, obj_report)

        self.writeFile(obj.name, obj, function() {
          self.callNextSite(--index, sites);
        })
      })
    }
    else {
      self.callNextSite(--index, sites);
    }
  })

};

Adtrack.prototype.writeFile = function(file_name, obj, callback) {
  fs.writeFile(DIR + file_name + '.json', JSON.stringify(obj), function(err) {
    if(err) {
      console.log(err);
    }
  });
  callback();
};

