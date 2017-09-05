const extractLabels = exports.extractLabels = rule => {
  const labels = [];
  Object.keys(rule.attrs).forEach(attr => {
    const attrDef = rule.attrs[attr];
    if (attrDef.type === 'label' && attrDef.value != null) {
      labels.push(attrDef.value);
    }
    if (attrDef.type === 'labels' && attrDef.value != null) {
      labels.push(...attrDef.value);
    }
  });
  return labels;
};
