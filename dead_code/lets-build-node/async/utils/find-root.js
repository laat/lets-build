const findUp = require('find-up');
const path = require('path');

let root;
module.exports = async (cwd = process.cwd()) => {
  if (root == null) {
    root = findUp(['.lets_build', '.lets_build.json'], cwd);
  }
  return path.dirname(await root);
}
