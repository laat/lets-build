const rule = (opts) => opts;
const genrule = (rule) => (opts) => rule({
  implementation: (props, ctx) => ctx.actions.runShell({
    name: props.name,
    srcs: props.srcs,
    outs: props.outs,
    cmd: props.cmd,
  }),
  options: opts,
})

const concatFiles = genrule(rule)({
  name: "concat",
  srcs: ["header.html", "main.html", "footer.html"],
  // outs: ["index.html"],
  cmd: "cat $SRC > $OUT",
})

const getActions = (rule) => {
  const actions = [];
  const ctx = {
    actions: {
      runShell: (opts) => {
        if (opts.name == null) {
          throw new Error('actions.runShell: name is required');
        }
        if (opts.outs == null) {
          throw new Error('actions.runShell [${name}]: outs is required');
        }
        if (!opts.outs instanceof Array) {
          throw new Error('actions.runShell [${name}]: outs must be an array');
        }
        if (opts.outs.length === 0) {
          throw new Error('actions.runShell [${name}]: outs is required');
        }
        actions.push(Object.assign({}, opts, {type: 'run_shell'}))
      },
    }
  }
  rule.implementation(rule.options, ctx);
  return actions;
}

console.log(getActions(concatFiles));
