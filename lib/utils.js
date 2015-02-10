var fs = require('fs'),
    tsv = require('tsv'),
    change_case = require('change-case'),
    DIR = '../reports/';

exports.readFile = function(name, callback) {
  fs.readFile(DIR + name, 'utf8', function (err, data) {
    if (err) {
     return console.log(err);
    }
    callback(data);
  });
}

exports.writeFile = function(file_name, obj, callback) {
  fs.writeFile(DIR + file_name + '.json', JSON.stringify(obj), function(err) {
    if(err) {
      console.log(err);
    }
  });
  callback();
};

exports.convertJsonToTsv = function(array_json, callback) {
  callback(tsv.stringify(array_json));
}

exports.cleanSiteName = function(site_name, callback) {
  var new_name,
      split_name = site_name.split('_');

  if (split_name.length > 2) {
    new_name = split_name[0] + '-' + split_name[1];
  }
  else {
    new_name = split_name[0]
  }

  callback(change_case.upperCaseFirst(new_name));
};