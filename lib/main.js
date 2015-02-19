var fs = require('fs'),
    merge = require('merge'),
    Site = require('./site'),
    Alexa = require('./alexa'),
    utils = require('./utils');

function Adtrack(options) {
  this.report_dir = options.report_dir;
}

Adtrack.prototype._init = function(first_argument) {
  fs.readdir(this.report_dir, function(err, report_names){
    if (err) {
      return console.log(err);
    }

    if (report_names.length == 0) {
      Alexa.populateReportFiles(function() {console.log('hello')});
    }
    else {
      Adtrack.prototype.createReport(report_names.length - 1, report_names)  
    }
  })
};

Adtrack.prototype.createReport = function(index, arr_reports) {
  var self = this;
  if (index == -1) return;

  utils.readFile(arr_reports[index], function(file) {
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
          self.createReport(--index, arr_reports);
        })
      })
    }
    else {
      self.createReport(--index, arr_reports);
    }
  })
};

// Get reports and callback with each report, index,
// total num of reports
Adtrack.prototype.getReports = function(callback) {
  fs.readdir(this.report_dir, function(err, report_names){
    if (err) {
     return console.log(err);
    }
    report_names.forEach(function(report_name, i) {
      utils.readFile(report_name, function(report) {
        var report = JSON.parse(report);
        callback(report, i, report_names.length)
      })
    })
  })
};

Adtrack.prototype.getTsvOfSites = function(callback) {
  var arr = [];
  this.getReports(function(report, i, length) {

    utils.cleanSiteName(report.name, function(clean_name) {

      arr.push({"name": clean_name, "total_count": report.report.total_count})

    })

    // Callback when last report is created
    if (i+1 == length) { 
      utils.convertJsonToTsv(arr, function(tsv) {
        callback(tsv);
      })
    };
  });
};

Adtrack.prototype.getTsvOfAvgByCategory = function(callback) {
  var category = {};
  var counter = {};
  var arr = [];

  this.getReports(function(report, i, length) {

    if ( !(category.hasOwnProperty(report.category)) ) {
      category[report.category] = 0;
      counter[report.category] = 0;
    }

    category[report.category] = category[report.category] + report.report.total_count;
    counter[report.category] += 1;

    if (i+1 == length) {
      for (var property in category) {
        if (category.hasOwnProperty(property)) {
          category[property] = (category[property] / counter[property]).toFixed(2);
          arr.push({"name": property, "count": category[property]});
        }
      }
      utils.convertJsonToTsv(arr, function(tsv) {
        callback(tsv);
      })
    };

  })
};

Adtrack.prototype.getTsvOfTrackers = function(callback) {
  var tracker = {};
  var arr = [];

  this.getReports(function(report, i, length) {
    var report = report.report;

    for (var key in report) {
      if (report.hasOwnProperty(key)) {
        if ( !(tracker.hasOwnProperty(key)) ) {
          tracker[key] = 0;
        }
        tracker[key]++;
      }
    }

    if (i+1 == length) {

      for (var key in tracker) {
        arr.push({"name": key, "count": tracker[key]})
      }
      utils.convertJsonToTsv(arr, function(tsv) {
        callback(tsv);
      })
    }

  })

};

module.exports = Adtrack;
