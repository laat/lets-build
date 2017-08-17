/*
  "Static Analysis" Reader

  Reads all .lets files from filesystem that has been referenced by load()
  transitively from main.
 */
const readScript = require('./read-script');
const resolveExtension = require('./resolve-extension');

module.exports = async function allReferencedFiles(main) {
  const fileCache = Object.create(null);

  function loadFile (request) {
    if(fileCache[request] == null) {
      fileCache[request] = _loadFile(request);
    }
  }
  async function _loadFile(request) {
    const filePath = await resolveExtension(request);
    const { src, script, extensions } = await readScript(filePath);

    extensions.forEach(loadFile);

    return {
      name: request,
      extensions,
      file: filePath,
      script,
    };
  }

  loadFile(main);

  // Wait for all files
  let len = 0;
  do {
    len = Object.keys(fileCache).length;
    await Promise.all(Object.values(fileCache));
  } while (len != Object.keys(fileCache).length)

  return Promise.all(Object.values(fileCache));
}
