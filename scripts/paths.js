const path = require('path');

// Base directories
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const distRootDir = path.join(rootDir, 'dist');

// Supported browsers
const browsers = ['firefox', 'chrome'];

// Path generators
function getDistDir(browserName) {
    return path.join(distRootDir, browserName);
}

function getCommonManifestPath() {
    return path.join(srcDir, 'manifests', 'common.json');
}

function getBrowserManifestPath(browserName) {
    return path.join(srcDir, 'manifests', `${browserName}.json`);
}

function getTargetManifestPath(browserName) {
    return path.join(getDistDir(browserName), 'manifest.json');
}

module.exports = {
    rootDir,
    srcDir,
    distRootDir,
    browsers,
    getDistDir,
    getCommonManifestPath,
    getBrowserManifestPath,
    getTargetManifestPath
};