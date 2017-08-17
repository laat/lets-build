const stripBom = require('strip-bom');
const esprima = require('esprima');
const fs = require('fs');
const vm = require('vm')

const readFile = (filePath, options) => new Promise((resolve, reject) => {
  fs.readFile(filePath, options, (err, data) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(data);
  })
});

const wrap = (code) => `(function(exports, load) {\n'use strict';\n${code}})`

const readScript = async (filename) => {
  const content = stripBom(await readFile(filename, 'utf8'));

  // TODO: proper static analysis with esprima/acorn/babylon?
  const loads = []
  const regex = /load\(['"](.*?)['"]\)/g
  while (match = regex.exec(content)) {
    loads.push(match[1]);
  }

  return {
    loads,
    script: new vm.Script(wrap(content), {
      displayErrors: true,
      lineOffset: -1,
      filename,
    })
  };
}

const cache = Object.create(null)
module.exports = async (fullPath) => {
  // TODO: http?
  if (cache[fullPath] != null) {
    return cache[fullPath];
  }
  const result = readScript(fullPath);
  cache[fullPath] = result;
  return result;
};
