const fs = require('fs');
const path = require('path');
const findRoot = require('../utils/find-root');

const _fileExists = (filePath) => new Promise((resolve, reject) => {
  // console.log({ name: 'real fileExists', filePath });
  fs.stat(filePath, (err, value) => {
    if (err) {
      resolve(false);
      return;
    }
    resolve(value.isFile());
  });
});

const existsCache = Object.create(null);
const fileExists = (filePath) => {
  if (existsCache[filePath] == null) {
    existsCache[filePath] = _fileExists(filePath);
  }
  return existsCache[filePath];
}

module.exports = async (request, dirname) => {
  let root;
  if (!request.startsWith('//')){
    root = dirname;
  } else {
    request = request.substr(2);
    root = await findRoot();
  }
  const [dir, filename] = request.split(':');
  root = path.join(root || '', dir || '');
  if (!filename) {
    throw new Error(`Path must include filename. EG: //src:my_def.let. Got "${request}"`)
  }
  if (!filename.endsWith('.lets')) {
    throw new Error(`Extensions must be defined in .lets files. Got "${request}"`)
  }

  const buildFile = path.join(root, 'BUILD.lets')
  if (!await fileExists(buildFile)) {
    throw new Error(`BUILD.lets file does not exist at: ${root}`)
  }

  const filePath = path.join(root, filename);
  if (!await fileExists(filePath)) {
    throw new Error(`File does not exist: ${filePath}`)
  }
  return filePath;
};
