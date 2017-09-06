import { Attr, Rule } from '../language-sandbox';

const enforceDefinition = (attr: Attr, attrName: string, ruleName: string) => {
  if (attr.definition == null) {
    // TODO(laat): Remove? attr.<attribute> should *always* produce definition
    throw new Error(
      `Rule ${ruleName} attribute ${attrName} has no definition. Got ${attr.definition}`
    );
  }
};
const enforceMandatory = (attr: Attr, attrName: string, ruleName: string) => {
  if (attr.definition.mandatory === true) {
    const errorText = `Rule ${ruleName} attribute ${attrName} is mandatory. Got ${attr.value}`;
    if (Array.isArray(attr.value) && attr.value.length === 0) {
      throw new Error(errorText);
    }
    if (attr.value == null) {
      throw new Error(errorText);
    }
  }
};

export default (ruleName: string, rule: Rule) => {
  Object.entries(rule.attrs).forEach(([attrName, attr]) => {
    enforceMandatory(attr, attrName, ruleName);
  });
};
