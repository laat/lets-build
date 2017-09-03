const genrule = (rule, attr) =>
  rule({
    impl: function genrule() {},
    attrs: {
      srcs: attr.label(),
    },
  });

module.exports = genrule;
