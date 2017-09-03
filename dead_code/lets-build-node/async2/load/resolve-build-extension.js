const path = require('path');
const fileExists = require('../utils/fileExists');
const getWorkspaceRoot = require('../utils/workspaceRoot');

const ROOT_RELATIVE_RE = new RegExp("^(//(.*?))(:(.*?))?$");

const patternMatch = (request) => {
  if (!request.startsWith('//')) {
    return {
      rootRelative: false,
      workspacePath: null,
      target: request.startsWith(':') ? request.substr(1) : request,
    }
  }
  const match = ROOT_RELATIVE_RE.exec(request);
  if (match) {
    [, rootRelative, workspacePath, , target] = match;
    return {
      rootRelative: rootRelative.startsWith('//'),
      workspacePath,
      target
    }
  } else {
    throw new Error('ParseError: could not parse target ${request}')
  }
}
const absolutePath = (workspaceRoot, wd, request) => {
  const { rootRelative, workspacePath, target } = patternMatch(request);
  if (rootRelative) {
    return path.join(workspaceRoot, workspacePath, target || 'BUILD.lets');
  } else {
    return path.join(wd, target || 'BUILD.lets')
  }
}
const checkedAbsolutePath = async (workspaceRoot, wd, request) => {
  const absPath = absolutePath(workspaceRoot, wd, request);
  if (absPath === null) {
    throw new Error(`failed to find abspath. Received workspaceRoot: ${workspaceRoot} wd: ${wd} request: ${request} `)
  }
  if (!await fileExists(absPath)) {
    throw new Error(`File does not exist: ${absPath}`)
  }
  return absPath;
}
module.exports = checkedAbsolutePath;
module.exports.sync = absolutePath;
module.exports.patternMatch = patternMatch;
// ## lazy testing
if (typeof require != 'undefined' && require.main==module) {
  (async () => {
    const wd = path.join(__dirname, '__test__/static')
    const root = await getWorkspaceRoot(wd);
    //console.log(await checkedAbsolutePath(root, wd, '//src/async/load/__test__/static2:BUILD.lets'))
    console.log(await checkedAbsolutePath(root, wd, '//:BUILD.lets'))
    console.log(await checkedAbsolutePath(root, wd, 'BUILD.lets'))
    console.log(await checkedAbsolutePath(root, wd, ':BUILD.lets'))
    console.log(await checkedAbsolutePath(root, wd, '//src/async/load/__test__/simple'))
    console.log(await checkedAbsolutePath(root, wd, '//src/async/load/__test__/simple:input.txt'))
  })()
}
