defs_file = (function(exports, load, rule, attrs) {
  exports.my_rule = rule({
    implementation: () => console.log('my rule'),
    attrs: {},
  })
});

build_file = (function(exports, load, rule) {
  const my_rule = load('defs_file', 'my_rule');
  my_rule({
    name: 'my_target'
  })
  console.log({ my_rule })
})

files = {
  'defs_file': defs_file,
  'build_file': build_file
}

rules = []
const rule = ({ implementation, attrs }) => (opts) => {
  rules.push({ implementation, attrs, name: opts.name });
}

const load = (filename, def) => {
  const defs = load_defs(filename)
  return defs[def];
}

const cache = {}
const load_defs = (filename) => {
  if (cache[filename] != null) {
    return cache[filename];
  }
  cache[filename] = exports = {}
  files[filename](exports, load, rule)
  return exports;
}

files['build_file'](exports, load, rule)
