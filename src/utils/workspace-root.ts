import * as path from 'path';
import mem = require('mem');
import findUp = require('find-up');

const ROOT_FILES = ['.lets_build', '.lets_build.json'];

export const workspaceRoot = mem(async (cwd?: string) =>
  path.dirname(await findUp(ROOT_FILES, { cwd }))
);

export const workspaceRootSync = mem((cwd?: string) =>
  path.dirname(findUp.sync(ROOT_FILES, { cwd }))
);
