import { GlobalRule, RuleGenerator } from './rule';
import ruleCollector from './rule';
import genrule from './rules/genrule';
import attr, {
  GlobalAttr,
  LabelsAttr,
  LabelAttr,
  OutputAttr,
  OutputsAttr,
} from './attr';
import * as vm from 'vm';

export interface Sandbox {
  console: typeof console;
  attr: GlobalAttr;
  rule: GlobalRule;
  genrule: RuleGenerator;
}
export type RuleImpl = Function;
export type RuleAttrs = { [key: string]: Attr };
export type Attr = LabelsAttr | LabelAttr | OutputAttr | OutputsAttr;
export type Rule = {
  name: string;
  impl: RuleImpl;
  attrs: RuleAttrs;
};
const createSandbox = () => {
  const rules: Array<Rule> = [];
  const rule = ruleCollector(rules);
  const sandbox: Sandbox = Object.create(null);
  sandbox.console = console;
  sandbox.attr = attr;
  sandbox.rule = rule;
  sandbox.genrule = genrule(rule, attr);
  return { sandbox, rules };
};
export default createSandbox;
