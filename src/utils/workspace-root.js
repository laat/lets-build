const findUp = require('find-up');
const path = require('path');
const mem1 = require('./mem1');

const ROOT_FILES = ['.lets_build', '.lets_build.json']

module.exports = mem1(async (wd) => {
  return path.dirname(await findUp(ROOT_FILES, wd));
})
module.exports.sync = mem1((wd) => {
  return path.dirname(findUp.sync(ROOT_FILES, wd));
});
