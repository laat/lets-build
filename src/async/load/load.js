/*
First, we load and evaluate all extensions and all BUILD files that are needed
for the build. The execution of the BUILD files simply instantiates rules (each
time a rule is called, it gets added to a graph). This is where macros are
evaluated.
*/

const fs = require('fs');
const vm = require('vm');
const path = require('path');
const compile = require('./compile')
const staticAnalyse = require('./static-analysis');
const resolveExtension = require('./resolve-build-extension');

const evaluatedAttrs = (rules) => rules.map((rule) => {
  const name = rule.options.name;

  const attrs = rule.definition.attrs;
  const options = rule.options;
  const evaluated = Object.create(null);
  Object.keys(attrs).forEach(attr => {
    attrFn = attrs[attr];
    evaluated[attr] = attrFn(options[attr], attr, name);
  });
  return {
    name,
    impl: rule.definition.impl,
    opts: evaluated,
  }
});

const isExternalLabel = (label) => label.startsWith('//');
const buildFileRef = (label) => label.split(':')[0];

const createCollector = () => {
  const rules = [];
  const labels = [];

  const rule = (definition) => (options) => {
    rules.push({ definition, options });
  }

  const attr = {
    label: (definition) => (name, attrName, ruleName) => {
      if (definition.mandatory === true) {
        if (name == null) {
          throw new Error(`${attrName} is mandatory in rule ${ruleName}`)
        }
      }
      labels.push(name);
      return name;
    }
  }

  const Label = (name) => {
    labels.push(name);
    return name;
  }

  return {
    collect: () => {
      return {
        rules: evaluatedAttrs(rules),
        external: labels.filter(isExternalLabel).map(buildFileRef)
      };
    },
    args: [rule, attr, Label],
  }
}

const loadSingleBuildFile = async (root, wd, request) => {
  if (!request.endsWith('BUILD.lets')) {
    request = request + ':BUILD.lets';
  }
  const files = await staticAnalyse(root, wd, request);
  const compiled = compile(files);

  const { collect, args } = createCollector();

  const exportsCache = Object.create(null);
  const load = (dirname) => (request) => {
    const absolutePath = resolveExtension.sync(root, dirname, request);
    if (exportsCache[absolutePath] != null) {
      return exportsCache[absolutePath];
    }

    // define the exports to inject into scripts
    const exports = exportsCache[absolutePath] = {};

    const scriptDefinition = compiled[absolutePath];
    const scriptDir = scriptDefinition.dirname
    const script = scriptDefinition.compiled;

    script.call(exports, exports, load(scriptDir), ...args)
    return exports
  };

  load(wd)(request);
  return collect();
}

const load = (root, wd, request) => {

}

// # lazy test
if (typeof require != 'undefined' && require.main==module) {
  const getWorkspaceRoot = require('../utils/workspaceRoot');
  (async () => {
    const wd = __dirname
    const root = await getWorkspaceRoot(wd);
    const request = `//src/async/load/__test__/simple`

    const result = await loadSingleBuildFile(root, wd, request);
    console.log('rules');
    console.log(result.rules);
    console.log('external');
    console.log(result.external);
  })()
}
