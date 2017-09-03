/*
  Rule Collector

  In the loading phase, script files are read from files and evaluated with some arguments.

  The important arguments are rule and attr

  The rule call defines a rule that should be evaluated in the analysis phase.

  The attr object, helps to collect referenced targets (for loading of
  referenced BUILD files). It also serves as a arguments validator.
*/
const isExternalLabel = (label) => label.startsWith('//');
const buildFileRef = (label) => label.split(':')[0];

const evaluateAttrs = (rule) => {
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
}

const createRuleCollector = () => {
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
      const evaluated = rules.map(evaluateAttrs);
      const external = Array.from(new Set(labels.filter(isExternalLabel).map(buildFileRef)));
      return {
        rules: evaluated,
        external,
      };
    },
    args: [rule, attr],
  }
}

module.exports = createRuleCollector;
