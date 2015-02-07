var Site = require('./site'),
    fs = require('fs'),
    DIR = '../reports/',
    merge = require('merge'),
    utils = require('./utils');


function Adtrack(options) {
  this.options = options;
}

Adtrack.prototype.createReport = function(index, sites) {
  var self = this;
  if (index == -1) return;

  utils.readFile(sites[index], function(file) {
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

        utils.writeFile(obj.name, obj, function() {
          self.createReport(--index, sites);
        })
      })
    }
    else {
      self.createReport(--index, sites);
    }
  })
};

Adtrack.prototype.getReports = function(callback) {
  fs.readdir(DIR, function(err, reports){
    if (err) {
     return console.log(err);
    }
    callback(reports)
  })
};

// var adtrack = new Adtrack({});
// adtrack.getReports(function(reports) {

//   Adtrack.prototype.createReport(reports.length - 1, reports)

// });


Adtrack.prototype.getTsvOfSites = function(callback) {
  var arr = [];
  this.getReports(function(report_names) {
    report_names.forEach(function(report_name, i) {
      utils.readFile(report_name, function(report) {
        var report = JSON.parse(report);
        arr.push({"name": report.name, "total_count": report.report.total_count})

        // Callback when last report is created
        if (i+1 == report_names.length) { 
          utils.convertJsonToTsv(arr, function(tsv) {
            callback(tsv);
          })
        };
      })
    })
  });
};

Adtrack.prototype.getTsvOfAvgByCategory = function(callback) {
  var category = {};
  var counter = {};
  var arr = [];

  this.getReports(function(report_names) {
    report_names.forEach(function(report_name, i) {
      utils.readFile(report_name, function(report) {
        var report = JSON.parse(report);
        
        if (!(report.category in category)) {
          category[report.category] = 0;
          counter[report.category] = 0;
        }

        category[report.category] = category[report.category] + report.report.total_count;
        counter[report.category] += 1;

        if (i+1 == report_names.length) {
          for (var property in category) {
            if (category.hasOwnProperty(property)) {
                category[property] = (category[property] / counter[property]).toFixed(2);
            }
          }
          arr.push(category)
          utils.convertJsonToTsv(arr, function(tsv) {
            callback(tsv);
          })
        };

      })
    })
  })
};


Adtrack.prototype.getTsvOfTrackers = function(first_argument) {
  // body...
};

Adtrack.prototype.getTsvOfPercentTrackers = function(first_argument) {
  // body...
};

var adtrack = new Adtrack({});
// adtrack.getTsvOfSites(function(tsv) { console.log(tsv) });
adtrack.getTsvOfAvgByCategory(function(tsv) { console.log(tsv) });







