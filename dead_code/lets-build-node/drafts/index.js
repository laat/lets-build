/*
1) collect rules for (/ * /BUILD.lets)
  - collect rules for single (BUILD.lets)
2) Analyze rules for given target //src/...
  - produces a list of actions?
3) execute actions
*/

const resolveBuildFile = require('./utils/resolve-build-file');
const resolveExtension = require('./utils/resolve-extension');
const readScript = require('./utils/read-script');
const vm = require('vm');

const createContext = () => {
  const sandbox = Object.create(null);
  sandbox.console = console;
  return vm.createContext(sandbox);
}
// first static analysis which creates empty exports={} for each file?
// then load() a file?
class BuildModule {
  constructor(filename, context) {
    this.exports = {};
    this.filename = filename;
    this.context = context || createContext();
  }
  static async resolveFilename(request) {
    return resolveExtension(request);
  }
  async load() {
    const { script, loads } = await readScript(this.filename);
    const compiled = script.runInContext(this.context);
    const load = (filename) => { console.log(filename) };
    compiled.call(this.exports, this.exports, load)
    return this.exports;
  }
  static async _load(request, context) {
    const filename = await this.resolveFilename(request);
    const mod = new BuildModule(filename, context);
    await mod.load();
    return mod.exports;
  }
}

const collectRules = async (path) => {
  const buildFile = await resolveExtension(path);

  const context = createContext();
  const { script, loads } = await readScript(buildFile);
  console.log(loads)
  const compiled = script.runInContext(context);
  const exports = {}
  compiled.call(exports, exports, () => {})
}

const main = async () => {
  // console.log(await collectRules('//js:BUILD3.lets'));
  console.log(await BuildModule._load('//js:BUILD3.lets'));
};
main();
