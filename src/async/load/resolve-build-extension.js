const path = require('path');
const fileExists = require('../utils/fileExists');
const getWorkspaceRoot = require('../utils/workspaceRoot');

const resolveRelative = async (wd, request) => {
  let [dir, filename] = parts = request.split(':');
  if (parts.length > 2) {
    throw new Error('IllegalArgument: only one : allowed. Got [${path}]');
  } else if (parts.length === 1) {
    filename = dir;
    dir = '';
  }
  if (!filename) {
    throw new Error('IllegalArgument: filename undefined')
  }
  const basedir = path.join(wd, dir || '');
  const buildFile = path.join(basedir, 'BUILD.lets')
  if (!await fileExists(buildFile)) {
    throw new Error(`BUILD.lets file does not exist at: ${wd}`)
  }
  const filePath = path.join(basedir, filename);
  if (!await fileExists(filePath)) {
    throw new Error(`File does not exist: ${filePath}`)
  }
  return filePath;
}

const resolveRootRelative = async (root, request) => {
  if (!request.startsWith('//')) {
    throw new Error(`IllegalArgument: rootRelative path must start whith //. Got [${request}]`)
  }
  const rootRelativePath = request.substr(2);
  return resolveRelative(root, rootRelativePath);
}

const resolveWorkdirRelative = async (wd, request) => {
  return resolveRelative(wd, request);
}

const resolveExtension = async (root, wd, request) => {
  if (request.startsWith('//')) {
    return resolveRootRelative(root, request);
  } else {
    return resolveRelative(wd, request);
  }
}

module.exports = resolveExtension;

const resolveRootRelativeSync = (root, request) => {
  if (!request.startsWith('//')) {
    throw new Error(`IllegalArgument: rootRelative path must start whith //. Got [${request}]`)
  }
  const rootRelativePath = request.substr(2);
  return resolveRelativeSync(root, rootRelativePath);
}
const resolveRelativeSync = (wd, request) => {
  let [dir, filename] = parts = request.split(':');
  if (parts.length > 2) {
    throw new Error('IllegalArgument: only one : allowed. Got [${path}]');
  }
  if (parts.length === 1) {
    filename = dir;
    dir = '';
  }
  const basedir = path.join(wd, dir || '');
  if (!filename) {
    throw new Error('IllegalArgument: filename undefined')
  }
  const filePath = path.join(basedir, filename);
  return filePath;
}
module.exports.sync = (root, wd, request) => {
  if (request.startsWith('//')) {
    return resolveRootRelativeSync(root, request);
  } else {
    return resolveRelativeSync(wd, request);
  }
}

// ## lazy testing
if (typeof require != 'undefined' && require.main==module) {
  (async () => {
    const wd = __dirname
    console.log({ wd })
    const root = await getWorkspaceRoot(wd);
    console.log({ wd, root })
    const request = `//src/async/load/__test__:BUILD.lets`
    console.log(await resolveExtension(root, wd, request));
  })()
}
