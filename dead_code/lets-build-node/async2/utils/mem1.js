module.exports = function (fn) {
  const cache = Object.create(null);
  return function (...args) {
    if (args.length > 1) {
      throw new Error('mem1: only one argument allowed');
    }
    const arg = args[0];
    if (cache[arg] != null) {
      return cache[arg];
    }
    return cache[arg] = fn(arg);
  }
}
