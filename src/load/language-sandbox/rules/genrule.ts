import { GlobalAttr } from '../attr';
import { GlobalRule, RuleGenerator } from '../rule';

export default (rule: GlobalRule, attr: GlobalAttr): RuleGenerator =>
  rule({
    impl: function genrule() {},
    attrs: {
      srcs: attr.label(),
    },
  });
