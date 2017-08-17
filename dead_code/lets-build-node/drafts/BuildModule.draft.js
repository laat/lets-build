

/* module.exports = class BuildModule {
  constructor(filename, buildfile) {
    this.exports = {};
    this.filename = filename;
    this.buildfile = buildfile;
  }
  load() {
    const content = stripBom(fs.readFileSync(this.filename, 'utf8'));
    const context = BuildModule.context;
    const wrapper = BuildModule.wrap(content);
    const compiledWrapper = vm.runInContext(wrapper, context, {
      filename: this.filename,
      lineOffset: -1,
      displayErrors: true
    })
    function loader() {
      console.log(arguments);
    }
    const bf = this.buildfile;
    function rule(...args) {
      console.log({ name: 'rule', args, bf })
    }
    return compiledWrapper.call(this.exports, this.exports, this.loadExtension.bind(this), rule)
  }
  loadExtension(filename) {
    return BuildModule._load(filename, this.buildfile);
  }
  static findRoot() {
    if (this.root != null) {
      return this.root;
    }
    const root = findUp.sync(['.lets_build', '.lets_build.json']);
    if (root == null) {
      throw new Error('Could not find root');
    }
    return this.root = path.dirname(root);
  }

  static wrap(code) {
    return `(function(exports, load, rule, attrs) {\n'use strict';\n${code}})`
  }

  static resolveFilename(filename) {
    const root = this.findRoot();
    if (!filename.startsWith('//')) {
      throw new Error(`Filename must start with "//" got "${filename}"`)
    }
    const pat = path.join(root, filename.substr(2))
    if (!fileExists(pat)) {
      throw new Error(`Could not find ${filename}`)
    }
    return pat
  }

  static get cache() {
    if (this._cache == null) {
      this._cache = Object.create(null);
    }
    return this._cache
  }
  static get context() {
    if (this._context == null) {
      this._context = Object.create(null);
      this._context['console'] = console;
      vm.createContext(this._context);
    }
    return this._context;
  }
  static _load(request, buildfile) {
    const filename = this.resolveFilename(request);
    const cachedModule = this.cache[filename];
    if (cachedModule != null) {
      return cachedModule.exports;
    }
    const mod = new BuildModule(filename, buildfile);
    this.cache[filename] = mod;

    let threw = true;
    try {
      mod.load()
      threw = false;
    } finally {
      if (threw === true) {
        delete this.cache[filename];
      }
    }
    return mod.exports
  }
}
*/
