const hasName = exports.hasName = rule => rule.name != null;

const isValid = exports.isValid = rule => hasName(rule);

// # lazy test
if (typeof require != 'undefined' && require.main == module) {
  const loadBuildFiles = require('../load');
  const rules = loadBuildFiles('//src/__test__/noop');
  console.log(Object.entries(rules).map(([name, rule]) => ({ name, valid: rule.name })));
}
