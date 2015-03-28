var util = require('util');
var fs = require('fs');
var path = require('path');
var EventEmitter = require('events').EventEmitter;

function DirectoryWalker() {
  EventEmitter.call(this);

  function walk(dir, callback) {
    try {
      fs.readdirSync(dir).forEach(function(fileName) {
        var filePath = path.join(dir, fileName);
        var stat = fs.statSync(filePath);
        if (stat.isFile()) {
          callback(null, fileName, dir);
        }
        else if (stat.isDirectory()) {
          walk(filePath, callback);
        }
      });
    }
    catch (err) {
      callback(err);
    }
  }

  this.walk = function (dir) {
    var walker = this;
    walk(dir, function(err, file, dir) {
      if (err) {
        walker.emit('error', err);
      }
      else {
        walker.emit('file', {
          file: file,
          dir: dir
        });
      }
    });
    return this;
  };
}

util.inherits(DirectoryWalker, EventEmitter);

module.exports = DirectoryWalker;
