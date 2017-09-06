class File {}
class DepSet {}
class Args {}
class Target {}
const create = () => {
  return {
    file: {},
    files: {},
    output: {},
    outputs: {},
    executable: {},
    actions: {
      declareDir: () => {},
      declareFile: () => {},
      noop: () => {},
      expandTemplate: () => {},
      run: () => {},
      runShell: () => {},
      write: () => {},
    },
  };
};
