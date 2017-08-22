const mem1 = require('./mem1');
const fs = require('fs');

const fileExists = (filePath) => new Promise((resolve, reject) => {
  fs.stat(filePath, (err, value) => {
    if (err) {
      resolve(false);
      return;
    }
    resolve(value.isFile());
  });
});

module.exports = mem1(fileExists);
