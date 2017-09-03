const path = require('path');
const fileExists = require('./fileExists');
const getWorkspaceRoot = require('./workspace-root').sync;

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
// TODO(laat): something smells. BUILD.lets auto suffix?!! NOPE
module.exports = (wd, request) => absolutePath(getWorkspaceRoot(), wd, request);
module.exports.patternMatch = patternMatch;
