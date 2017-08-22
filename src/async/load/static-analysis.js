/*
  static analysis of files, returns files and content
*/
const path = require('path');
const readFile = require('../utils/readFile');
const mem1 = require('../utils/mem1');
const resolveExtension = require('./resolve-build-extension');

const LOAD_STATEMENT_RE = /load\(['"](.*?)['"]\)/g

const findLoadStatements = (src) => {
  const extensions = [];
  while (match = LOAD_STATEMENT_RE.exec(src)) {
    extensions.push(match[1]);
  }
  return extensions;
}

const loadSingleFile = async (workspaceRoot, wd, request) => {
  const absolutePath = await resolveExtension(workspaceRoot, wd, request)
}

const enforceFilename = (filename) => {
  if (!filename.endsWith('.lets')) {
    throw new Error('load(filename) must load files with .lets extension')
  }
}

const analyse = async (workspaceRoot, wd, request) => {
  const srcs = Object.create(null);
  const read = async (wd2, req) => {
    const absolutePath = await resolveExtension(workspaceRoot, wd2, req)
    const dirname = path.dirname(absolutePath);
    if (srcs[absolutePath] != null) {
      return;
    }
    const src = await readFile(absolutePath);
    const fileLoads = findLoadStatements(src);
    fileLoads.forEach(enforceFilename);
    const loads = Object.create(null)
    await Promise.all(fileLoads.map(async (target) => {
      loads[target] = await resolveExtension(workspaceRoot, dirname, target);
    }));
    srcs[absolutePath] = { src, loads };
    await Promise.all(fileLoads.map(r => read(dirname, r)))
  }
  await read(wd, request);
  return srcs
}

module.exports = analyse;

// ## lazy testing
if (typeof require != 'undefined' && require.main==module) {
  const getWorkspaceRoot = require('../utils/workspaceRoot');
  (async () => {
    const wd = __dirname
    const root = await getWorkspaceRoot(wd);
    const request = `//src/async/load/__test__/static:BUILD.lets`
    console.log(await analyse(root, wd, request));
  })()
}
