import { AttrCallbacks, AttrValue } from './attr';
import { Rule, RuleAttrs, RuleImpl, Attr } from './index';

const ruleCollector: RuleCollector = rules => definition => options => {
  const attrs: RuleAttrs = Object.keys(definition.attrs).reduce((map, attr) => {
    const callback: any = definition.attrs[attr];
    return Object.assign(map, { [attr]: callback(options[attr]) });
  }, {});
  const theRule = { name: options.name, impl: definition.impl, attrs };
  rules.push(theRule);
  return theRule;
};
export default ruleCollector;

export type RuleAttrsCallbacks = { [key: string]: AttrCallbacks };
export type RuleDefinition = {
  impl: RuleImpl;
  attrs: RuleAttrsCallbacks;
};
export type RuleOptions = {
  name: string;
  [key: string]: AttrValue;
};

export type RuleGenerator = (options: RuleOptions) => Rule;
export type GlobalRule = (definition: RuleDefinition) => RuleGenerator;
export type RuleCollector = (rules: Array<Rule>) => GlobalRule;
