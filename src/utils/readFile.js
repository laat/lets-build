const mem1 = require('./mem1');
const stripBom = require('strip-bom');
const fs = require('fs');

const readFile = (filePath) => new Promise((resolve, reject) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(stripBom(data));
  })
});

const readFileSync = (filePath) => stripBom(fs.readFileSync(filePath, 'utf8'));

module.exports = mem1(readFile);
module.exports.sync = mem1(readFileSync);
