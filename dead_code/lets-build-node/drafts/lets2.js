const vm = require('vm');

const wrap_code = (code) => `
(function(exports, load, rule, attrs) {
  'use strict';
${code}
});
`

files = {
  'build_file': new vm.Script(wrap_code(`
const my_rule = load('defs_file', 'my_rule');
my_rule({
  name: 'my_target'
})
console.log({ my_rule })
`), { lineOffset: -1, filename: 'build_file' }),
  'defs_file': new vm.Script(wrap_code(`
  exports.my_rule = rule({
    implementation: () => console.log('my rule'),
    attrs: {},
  })
`), { lineOffset: -1, filename: 'defs_file' }),
}

rules = []
cache = []

const sandbox = { console }
vm.createContext(sandbox);
const fn = files.build_file.runInContext(sandbox);

const rule = ({ implementation, attrs }) => (opts) => {
  rules.push({ implementation, attrs, name: opts.name });
};
const load = () => {
  return () => {};
}

fn({}, load, rule)
console.log(sandbox)
