var fs = require('fs');

function Ad() {
  //
}

// Refactor to not read on every call
Ad.prototype.fetchAll = function(callback) {
  fs.readFile('../ads.json', 'utf8', function (err, data) {
    if (err) {
     return console.log(err);
    }
    callback(data);
  });
};

module.exports = Ad;