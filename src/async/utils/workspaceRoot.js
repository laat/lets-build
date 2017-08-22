const findUp = require('find-up');
const path = require('path');
const mem1 = require('./mem1');

const findRoot = async (wd) => {
  return path.dirname(await findUp(['.lets_build', '.lets_build.json'], wd));
}

module.exports = mem1(findRoot);
