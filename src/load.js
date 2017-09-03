const vm = require('vm');
const path = require('path');
const readFile = require('./utils/readFile').sync;
const fileExists = require('./utils/fileExists').sync;
const createSandbox = require('./sandbox');
const locate = require('./utils/locate');

const wrap = code => `(function(exports, load) { 'use strict';\n${code}})`;
const loadFile = filename => {
  const src = readFile(filename);
  const script = new vm.Script(wrap(src), { displayErrors: true, filename });
  return { filename, dirname: path.dirname(filename), src, script };
};

const loadSingle = target => {
  const buildFilePath = locate('.', target);
  const { sandbox, rules } = createSandbox();
  const context = vm.createContext(sandbox);
  const exportsCache = Object.create(null);

  const load = dirname => file => {
    const absolutePath = locate(dirname, file);

    if (exportsCache[absolutePath] != null) {
      return exportsCache[absolutePath];
    }

    const exports = (exportsCache[absolutePath] = {});
    const scriptFile = loadFile(absolutePath);
    scriptFile.script
      .runInContext(context)
      .call(exports, exports, load(scriptFile.dirname));
    return exports;
  };
  load(path.dirname(buildFilePath))(path.basename(buildFilePath));
  return rules;
};

// # lazy test
if (typeof require != 'undefined' && require.main == module) {
  const rules = loadSingle('//src/__test__/noop');
  console.log(JSON.stringify(rules, undefined, 2));
}
