const stripBom = require('strip-bom');
const fs = require('fs');
const vm = require('vm');
const resolveExtension = require('./resolve-extension');

const readFile = (filePath, options) => new Promise((resolve, reject) => {
  // console.log({ name: 'real readFile', filePath });
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      reject(err);
      return;
    }
    resolve(stripBom(data));
  })
});


const wrap = (code) => `(function(exports, load, rule) {\n'use strict';\n${code}})`

const _readScript = async (filePath) => {
  const src = await readFile(filePath);

  // TODO: proper static analysis with esprima/acorn/babylon?
  const extensions = [];
  const regex = /load\(['"](.*?)['"]\)/g
  while (match = regex.exec(src)) {
    extensions.push(match[1]);
  }

  return {
    filePath,
    src,
    extensions,
    script: new vm.Script(wrap(src), {
      displayErrors: true,
      lineOffset: -1,
      filename: filePath,
    })
  }
}

const scriptCache = Object.create(null);
const readScript = async (filePath) => {
  if(scriptCache[filePath] == null) {
    scriptCache[filePath] = _readScript(filePath);
  }
  return scriptCache[filePath];
}

module.exports = readScript;
