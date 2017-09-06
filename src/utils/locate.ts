import * as path from 'path';
import { fileExists } from './fileExists';
import { workspaceRootSync } from './workspace-root';

const ROOT_RELATIVE_RE = new RegExp('^(//(.*?))(:(.*?))?$');

const patternMatch = (request: string) => {
  if (!request.startsWith('//')) {
    return {
      rootRelative: false,
      workspacePath: null,
      target: request.startsWith(':') ? request.substr(1) : request,
    };
  }
  const match = ROOT_RELATIVE_RE.exec(request);
  if (match) {
    const [, rootRelative, workspacePath, , target] = match;
    return {
      rootRelative: rootRelative.startsWith('//'),
      workspacePath,
      target,
    };
  } else {
    throw new Error('ParseError: could not parse target ${request}');
  }
};
const buildFileAbsolutePath = (
  workspaceRoot: string,
  cwd: string,
  request: string
) => {
  const { rootRelative, workspacePath } = patternMatch(request);
  if (rootRelative) {
    return path.join(workspaceRoot, workspacePath, 'BUILD.lets');
  } else {
    return path.join(cwd, 'BUILD.lets');
  }
};

const targetAbsolutePath = (
  workspaceRoot: string,
  wd: string,
  request: string
) => {
  const { rootRelative, workspacePath, target } = patternMatch(request);
  if (target == null) {
    throw new Error(`request has no target. ${request}`);
  }
  if (rootRelative) {
    return path.join(workspaceRoot, workspacePath, target);
  } else {
    return path.join(wd, target);
  }
};

export const locateBuildFile = (cwd: string, request: string) =>
  buildFileAbsolutePath(workspaceRootSync(), cwd, request);

export const locateFile = (cwd: string, request: string) =>
  targetAbsolutePath(workspaceRootSync(), cwd, request);
