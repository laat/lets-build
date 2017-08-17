const fs = require('fs');
const path = require('path');
const findRoot = require('./find-root');

const fileExists = (filePath) => new Promise((resolve, reject) => {
  fs.stat(filePath, (err, value) => {
    if (err) {
      resolve(false);
      return;
    }
    resolve(value.isFile());
  });
});

module.exports = async (request) => {
  if (!request.startsWith('//')) {
    throw new Error(`Filename must start with "//" got "${request}"`);
  }
  let filename = request.substr(2)
  if (filename.includes(':')) {
    filename = filename.substr(0, filename.indexOf(':'));
  }

  const root = await findRoot();
  let filePath = path.join(root, filename);
  if (!await fileExists(filePath)) {
    throw new Error(`Could not find ${filePath}`)
  }
  return filePath;
};
