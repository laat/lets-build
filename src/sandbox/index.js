const vm = require('vm');
const genrule = require('./genrule');

const genAttr = type => definition => value => ({ type, definition, value });
const attr = Object.freeze({
  output: genAttr('output'),
  outputs: genAttr('outputs'),
  label: genAttr('label'),
  labels: genAttr('labels'),
});

const ruleCollector = () => {
  const rules = [];
  const rule = definition => options => {
    const attrs = Object.keys(definition.attrs).reduce(
      (map, attr) =>
        Object.assign(map, { [attr]: definition.attrs[attr](options[attr]) }),
      {}
    );
    rules.push({ name: options.name, impl: definition.impl, attrs });
  };
  return { rule, rules };
};

/**
 * Creates a VM context with globals available for BUILD files.
 */
const createContext = () => {
  const { rules, rule } = ruleCollector();
  const sandbox = Object.create(null);
  sandbox.console = console;
  sandbox.attr = attr;
  sandbox.rule = rule;
  sandbox.genrule = genrule(rule, attr);
  return { sandbox, rules };
};

module.exports = createContext;
