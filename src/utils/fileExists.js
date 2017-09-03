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

const fileExistsSync = (filePath) => {
  try {
    const stat = fs.statSync(filePath)
    return stat.isFile();
  } catch (err) {
    return false;
  }
}

module.exports = mem1(fileExists);
module.exports.sync = mem1(fileExistsSync);
