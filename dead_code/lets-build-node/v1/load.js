/*
First, we load and evaluate all extensions and all BUILD files that are needed
for the build. The execution of the BUILD files simply instantiates rules (each
time a rule is called, it gets added to a graph). This is where macros are
evaluated.


NOTES:

This is the simplest silliest implementation that I can think of for loading BUILD files.
It is mostly uncached (some cache needed to break cycles) and synchronous.
*/

const fs = require('fs');
const vm = require('vm');
const path = require('path');
const stripBom = require('strip-bom'); // strip byte order mark

/*
  The basic building blocks for a build file and extensions:

  exports:
    So we can load exported macros from other files.
    Should work like the normal nodejs module pattern.

  load(path):
    Reads a script, executes it, and returns the exports object.

  rule(options):
    A function to define build rules.
*/
const wrap = (code) => `(function(exports, load, rule) { 'use strict';\n${code}})`

/*
  Read script from the filesystem, wrap it, and compile the script.
 */
const readScript = (filePath) => {
  const src = stripBom(fs.readFileSync(filePath, 'utf8'));
  return {
    filePath,
    dirname: path.dirname(filePath),
    src,
    script: new vm.Script(wrap(src), {
      displayErrors: true,
      filename: filePath,
    })
  }
}

const loadSingleBuildFile = (filePath) => {
  /*
  The context defines available globals. Since BUILD files should be quick to
  evaluate, we restrict access to everything execpt console.*
  */
  const sandbox = Object.create(null);
  sandbox.console = console;
  context = vm.createContext(sandbox);

  /*
  Defining the rule function that BUILD files should use.

  It simply collects all calls in an array, that we will use later in the
  analysis step.

  Should ideally have checks to verify that a build rule is properly defined,
  but this is implementation details we can do at a later stage.

  Example
  ```
  // defining a custom build rule

  const impl = () => {
    // ... implementation of a rule
  };
  const my_rule = rule({
    impl,
    attrs: {
      // some attributes to use
    }
  });

  // using the custom build rule
  my_rule({
    name: 'generate_file'
  });
  ```
   */
  const rules = [];
  const rule = (definition) => (options) => {
    rules.push({ definition, options });
  }

  /*
  We evaluate each file once, and collect the exports object.
  To break cycles, we cache the exports object from a single load
  */
  const exportsCache = Object.create(null);
  const load = (dirname) => (file) => {
    // Paths in bazel are either //relative/too/workspace or :local
    // For simplisity, lets only allow '../relative/paths'
    const absolutePath = path.join(dirname, file);

    if (exportsCache[absolutePath] != null) {
      return exportsCache[absolutePath];
    }

    // define the exports to inject into scripts
    const exports = exportsCache[absolutePath] = {};
    const scriptDefinition = readScript(absolutePath);
    const compiled = scriptDefinition.script.runInContext(context);

    compiled.call(exports, exports, load(scriptDefinition.dirname), rule)
    return exports
  };

  load(path.dirname(filePath))(path.basename(filePath));
  return rules;
}

// ## lazy testing
if (typeof require != 'undefined' && require.main==module) {
  const assert = require('assert');
  const buildFile = path.join(__dirname, '__test__', 'BUILD.simplest');
  const rules = loadSingleBuildFile(buildFile);

  assert(rules[0].definition == rules[1].definition) // reuses definition
  console.log(rules);
}
