import { Rule } from '../language-sandbox';

export const extractLabels = (rule: Rule) => {
  const labels = [] as Array<string>;
  Object.keys(rule.attrs).forEach(attr => {
    const attrDef = rule.attrs[attr];
    if (attrDef.value == null) {
      return;
    }
    if (attrDef.type === 'label') {
      labels.push(attrDef.value);
    }
    if (attrDef.type === 'labels') {
      labels.push(...attrDef.value);
    }
  });
  return labels;
};

export const isExternal = (target: string) => target.includes(':');
export const targetRoot = (target: string) => target.split(':')[0];

export const externalBuildFiles = (rule: Rule): Array<string> =>
  extractLabels(rule)
    .filter(isExternal)
    .map(targetRoot);
