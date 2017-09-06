/*
The global module attrs
*/
export type LabelsDefinition = { mandatory?: boolean };
export type LabelsValue = Array<string>;
export interface LabelsAttr {
  type: 'labels';
  definition: LabelsDefinition;
  value: LabelsValue;
}
export type LabelsDefiner = (definition: LabelsDefinition) => LabelsCallback;
export type LabelsCallback = (value: LabelsValue) => LabelsAttr;

export type LabelDefinition = { mandatory?: boolean };
export type LabelValue = string;
export interface LabelAttr {
  type: 'label';
  definition?: LabelDefinition;
  value?: LabelValue;
}
export type LabelDefiner = (definition?: LabelDefinition) => LabelCallback;
export type LabelCallback = (value?: LabelValue) => LabelAttr;

export type OutputDefinition = { mandatory?: boolean };
export type OutputValue = string;
export interface OutputAttr {
  type: 'output';
  definition: OutputDefinition;
  value: OutputValue;
}
export type OutputDefiner = (definition: OutputDefinition) => OutputCallback;
export type OutputCallback = (value: OutputValue) => OutputAttr;

export type OutputsDefinition = { mandatory?: boolean };
export type OutputsValue = Array<string>;
export interface OutputsAttr {
  type: 'outputs';
  definition: OutputsDefinition;
  value: OutputsValue;
}
export type OutputsDefiner = (definition: OutputsDefinition) => OutputsCallback;
export type OutputsCallback = (value: OutputsValue) => OutputsAttr;

export type AttrCallbacks =
  | LabelsCallback
  | LabelCallback
  | OutputCallback
  | OutputsCallback;
export type AttrValue = LabelsValue | LabelValue | OutputValue | OutputsValue;

export interface GlobalAttr {
  labels: LabelsDefiner;
  label: LabelDefiner;
  output: OutputDefiner;
  outputs: OutputsDefiner;
}
const enforceOptionalString = (value: any) => {
  if (value == null) {
    return value;
  }
  if (typeof value !== 'string') {
    throw new Error(`value must be string. Got ${value}`);
  }
  return value;
};
const enforceOptionalStringArray = (value: any): Array<string> => {
  if (value == null) {
    return value;
  }
  if (!Array.isArray(value)) {
    throw new Error(`Value is not an array: Got ${value}`);
  }
  if (value.some(value => typeof value !== 'string')) {
    throw new Error(`All values must be string. Got ${value}`);
  }
  return value;
};
const attr: GlobalAttr = {
  label: definition => value => ({
    type: 'label',
    definition: definition || {},
    value: enforceOptionalString(value),
  }),
  labels: definition => value => ({
    type: 'labels',
    definition: definition || {},
    value: enforceOptionalStringArray(value),
  }),

  output: definition => value => ({
    type: 'output',
    definition: definition || {},
    value: enforceOptionalString(value),
  }),
  outputs: definition => value => ({
    type: 'outputs',
    definition: definition || {},
    value: enforceOptionalStringArray(value),
  }),
};
export default attr;
