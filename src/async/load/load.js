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

  const attrs = rule.definition.attrs || {};
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
    output: (definition) => (value) => ({ type: 'output', value, definition}),
    outputs: (definition) => (value) => ({ type: 'outputs', value, definition}),
    label: (definition) => (value, attrName, ruleName) => {
      if (definition.mandatory === true) {
        if (value == null) {
          throw new Error(`${attrName} is mandatory in rule ${ruleName}`)
        }
      }
      labels.push(value);
      return { type: 'label', value, definition };
    },
    labels: (definition) => (value) => {
      if (Array.isArray(value)) {
        value.forEach(v => { labels.push(v) });
      }
      return { type: 'labels', value, definition };
    },
  }

  return {
    collect: () => {
      const evaluated = evaluatedAttrs(rules);
      const external = Array.from(new Set(labels.filter(isExternalLabel).map(buildFileRef)));
      return {
        rules: evaluated,
        external,
      };
    },
    args: [rule, attr],
  }
}

const loadSingleBuildFile = async (root, request) => {
  const wd = request.substr(2);
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

const load = async (root, request) => {
  const files = Object.create(null);
  const _load = async (request) => {
    if (files[request] != null) {
      return;
    }
    const { rules, external } = await loadSingleBuildFile(root, request)
    files[request] = rules;
    await Promise.all(external.map(_load));
  }
  await _load(request);
  return files;
}

// # lazy test
if (typeof require != 'undefined' && require.main==module) {
  const getWorkspaceRoot = require('../utils/workspaceRoot');
  (async () => {
    const root = await getWorkspaceRoot(__dirname);
    const request = `//src/async/load/__test__/simple`

    const result = await load(root, request);
    console.log(JSON.stringify(result, undefined, 2));
    console.log(result['//src/async/load/__test__/simple'])
  })()
}
