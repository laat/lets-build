'use strict';
const vm = require('vm');
const path = require('path');

const wrap = (code) => `(function(exports, load, rule, attr) { 'use strict';\n${code}})`;

const createContext = () => {
  const sandbox = Object.create(null);
  sandbox.console = console;
  return vm.createContext(sandbox);
}

const context = createContext();

const compile = (srcs) => {
  const result = Object.create(null);
  Object.keys(srcs).forEach(filename => {
    const { src, loads } = srcs[filename];
    const dirname = path.dirname(filename);
    const script = new vm.Script(wrap(src), { displayErrors: true, filename });
    const compiled = script.runInContext(context);
    result[filename] = { filename, dirname, src, loads, compiled };
  })

  return result;
}
module.exports = compile;

// # lazy test
if (typeof require != 'undefined' && require.main==module) {
  (async () => {
    const files = {
      '/Users/sigurd/git/lets-build/src/async/load/__test__/static/BUILD.lets': {
        src: 'load(\':circular1.lets\')\n',
        loads: { ':circular1.lets': '/Users/sigurd/git/lets-build/src/async/load/__test__/static/circular1.lets' }
      },
      '/Users/sigurd/git/lets-build/src/async/load/__test__/static/circular1.lets':
      {
        src: 'load(\':circular2.lets\')\n',
        loads: { ':circular2.lets': '/Users/sigurd/git/lets-build/src/async/load/__test__/static/circular2.lets' }
      },
      '/Users/sigurd/git/lets-build/src/async/load/__test__/static/circular2.lets':
      {
        src: 'load(\':circular1.lets\')\n',
        loads: { ':circular1.lets': '/Users/sigurd/git/lets-build/src/async/load/__test__/static/circular1.lets' }
      }
    }
    console.log(compile(files));
  })()
}
