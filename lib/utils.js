var fs = require('fs'),
    tsv = require('tsv'),
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