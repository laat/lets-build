const findUp = require('find-up');
const stripBom = require('strip-bom');
const path = require('path');
const fs = require('fs');
const vm = require('vm');

function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  }
  catch (err) {
    return false;
  }
}

const BuildModule = module.exports = function BuildModule (filename, context, buildfile) {
  this.exports = {}
  this.filename = filename
  this.context = context
  this.buildfile = buildfile
}


BuildModule.findRoot = function findRoot() {
  if (this.root != null) {
    return this.root;
  }
  const root = findUp.sync(['.lets_build', '.lets_build.json']);
  if (root == null) {
    throw new Error('Could not find root');
  }
  return this.root = path.dirname(root);
}


BuildModule.resolveFilename = function resolveFilename(wspath){
  const root = this.findRoot();
  if (!wspath.startsWith('//')) {
    throw new Error(`Filename must start with "//" got "${wspath}"`)
  }
  const filename = path.join(root, wspath.substr(2))
  if (!fileExists(filename)) {
    throw new Error(`Could not find ${wspath}`)
  }
  return filename
}

BuildModule.wrap = function wrap(code) {
  return `(function(exports, load, rule, attrs) {\n'use strict';\n${code}})`
}
BuildModule._scriptCache = Object.create(null);
BuildModule._loadScript = function _loadScript(filename) {
  if (this._scriptCache[filename] != null) {
    return this._scriptCache[filename];
  }
  const content = stripBom(fs.readFileSync(filename, 'utf8'));
  const script = new vm.Script(this.wrap(content), {
    displayErrors: true,
    lineOffset: -1,
    filename: 'build_file'
  });
  this._scriptCache[filename] = script;
  return script;
}

BuildModule._createContext = function _createContext() {
  const sandbox = Object.create(null);
  sandbox.console = console
  sandbox.global = sandbox
  return vm.createContext(sandbox);
}

BuildModule._load = function _load(wspath, context, buildfile) {
  if (context == null) {
    context = this._createContext();
  }
  const filename = this.resolveFilename(wspath);
  const mod = new BuildModule(filename, context, buildfile || filename);
  mod.load()
  return mod.exports
}

BuildModule.prototype.load = function load() {
  const script = BuildModule._loadScript(this.filename);
  const compiled = script.runInContext(this.context);
  const buildfile = this.buildfile
  function rule(...args) {
    return (...args2) => {
      console.log({ name: 'rule', args, args2, buildfile })
    }
  }
  return compiled.call(this.exports, this.exports, this.loadExtension.bind(this), rule)
}
BuildModule.prototype.loadExtension = function (filename) {
  return BuildModule._load(filename, this.context, this.buildfile);
}
