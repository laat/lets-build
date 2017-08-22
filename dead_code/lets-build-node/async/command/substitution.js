"use strict";

const keys = ['location', 'locations']
const SUBSTITUTE_RE = new RegExp('\\$\\(('+keys.join('|')+') ([^\)]+)\\)', 'g');

module.exports = (srcs) => (cmd) => cmd.replace(SUBSTITUTE_RE, createReplacer(srcs))

const createReplacer = (srcs) => (match, type, target) => {
  checkExists(srcs, target);
  switch (type) {
    case 'location':
      return location(srcs, target);
    case 'locations':
      return locations(srcs, target);
    default:
      throw new Error(`${type} substitution is not yet implemented`);
  }
}

const location = (srcs, target) => {
  const targetFile = srcs[target];
  if (typeof targetFile !== 'string') {
    throw new Error(`${target} must be a single file. Use locations instead?`)
  }
  return `"${targetFile}"`;
}
const locations = (srcs, target) => {
  const targetFiles = srcs[target];
  if(!(targetFiles instanceof Array)){
    throw new Error(`${targetFiles} must be multiple files. Use location instead?`)
  }
  return targetFiles.map(s => `"${s}"`).join(' ');
}


function checkExists(srcs, target) {
  if (!srcs.hasOwnProperty(target)) {
    throw new Error(`${target} is not defined as and input.`)
  }
  if (srcs[target] == null) {
    throw new Error(`${target} has no output.`);
  }
}

// ## lazy testing
if (typeof require != 'undefined' && require.main==module) {
  const srcs = {
    '//other:gen': 'other.txt',
    '//other2:gen': 'other2.txt',
    '//some:files': ['some.txt', 'files.txt'],
  };

  const cmd = "cat $(locations //some:files) $(location //other:gen) $(location //other2:gen) > $@";
  console.log(module.exports(srcs)(cmd))
}
