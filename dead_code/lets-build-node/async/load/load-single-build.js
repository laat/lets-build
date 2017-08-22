const vm = require('vm');
const loadScripts = require('./all-referenced-scripts');

const createContext = () => {
  const sandbox = Object.create(null);
  sandbox.console = console;
  return vm.createContext(sandbox);
}

const createLoad = (scripts, rule) => {
  const namedScripts = scripts.reduce((map, script) => Object.assign(map, { [script.name]: script }), {});
  const exportsCache = Object.create(null);
  const context = createContext();

  return function load(name) {
    const cachedExports = exportsCache[name];
    if (cachedExports != null) {
      return cachedExports;
    }

    const exports = exportsCache[name] = {};
    const { script } = namedScripts[name];
    const compiled = script.runInContext(context);
    compiled.call(exports, exports, load, rule)
    return exports;
  }
};

const loadSingleBuildFile = module.exports = async (main) => {
  const buildFile = `${main}:BUILD.lets`;
  const scripts = await loadScripts(buildFile);
  rules = [];
  const rule = (definition) => (options) => rules.push({ options, definition })
  const load = createLoad(scripts, rule);
  load(buildFile)
  return rules;
}
