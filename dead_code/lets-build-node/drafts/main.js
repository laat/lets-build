const BuildModule = require('./BuildModule')
// console.log(BuildModule.resolveFilename('//js/example_defs.lets_def'));
// console.log(BuildModule._loadScript('//js/example_defs.lets_def'));
// console.log(BuildModule._load('//js/BUILD.lets'))
// console.log(BuildModule._load('//js/BUILD2.lets'))
BuildModule._load('//js/BUILD.lets')
BuildModule._load('//js/BUILD2.lets')
