import * as path from 'path';
import * as vm from 'vm';
import { Rule } from './language-sandbox';
import createSandbox from './language-sandbox';
import validateAttrs from './utils/validateAttrs';
import { externalBuildFiles, targetRoot } from './utils/label.utils';
import { locateBuildFile, locateFile } from '../utils/locate';
import { readFileSync } from '../utils/readFile';

const wrap = (code: string) =>
  `(function(exports, load) { 'use strict';\n${code}})`;
const loadFile = (filename: string) => {
  const src = readFileSync(filename);
  const script = new vm.Script(wrap(src), { displayErrors: true, filename });
  return { filename, dirname: path.dirname(filename), src, script };
};

const loadSingle = (target: string) => {
  const buildFilePath = locateBuildFile('.', target);
  const { sandbox, rules } = createSandbox();
  const context = vm.createContext(sandbox);
  const exportsCache = Object.create(null);

  const load = (dirname: string) => (file: string) => {
    const absolutePath = locateFile(dirname, file);

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

const ruleMap = (rules: Array<Rule>) => {
  const rulesMap = Object.create(null);
  Object.entries(rules).forEach(([buildFile, rules]) => {
    rules.forEach(({ name, impl, attrs }: Rule) => {
      if (name == null) {
        throw new Error(`name is required. File: ${buildFile}`);
      }
      if (impl == null) {
        throw new Error(`${name} has no impl. File: ${buildFile}`);
      }
      rulesMap[buildFile + ':' + name] = { impl, attrs };
    });
  });
  return rulesMap;
};

const loadBuildFiles = (target: string) => {
  const buildRules = Object.create(null);
  const load = (buildTarget: string) => {
    if (buildRules[buildTarget] != null) {
      return buildRules[buildTarget];
    }
    const rules = (buildRules[buildTarget] = loadSingle(buildTarget));
    rules
      .map(externalBuildFiles)
      .reduce((arr, val) => [...arr, ...val], []) // flatten
      .forEach(load);
  };

  load(targetRoot(target));

  const rules = ruleMap(buildRules);
  Object.entries(rules).forEach(([ruleName, rule]) =>
    validateAttrs(ruleName, rule)
  );
  return rules;
};

export default loadBuildFiles;

if (typeof require != 'undefined' && require.main == module) {
  const rules = loadBuildFiles('//src/load/__test__/noop');
  console.log(JSON.stringify(rules, undefined, 2));
}
