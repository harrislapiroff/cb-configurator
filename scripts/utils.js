const fs = require('fs');
const path = require('path');
const paths = require('./paths');

/**
 * Deep merges two objects
 * @param {Object} target - The target object
 * @param {Object} source - The source object to merge
 * @returns {Object} - Merged object
 */
function deepMerge(target, source) {
    const output = { ...target };
    
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    output[key] = source[key];
                } else {
                    output[key] = deepMerge(target[key], source[key]);
                }
            } else {
                output[key] = source[key];
            }
        });
    }
    
    return output;
}

/**
 * Checks if value is an object
 * @param {*} item - Item to check
 * @returns {boolean}
 */
function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Copies files recursively
 * @param {string} source - Source path
 * @param {string} destination - Destination path
 */
function copyRecursive(source, destination) {
    if (fs.statSync(source).isDirectory()) {
        if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
        }
        
        const files = fs.readdirSync(source);
        for (const file of files) {
            const srcPath = path.join(source, file);
            const destPath = path.join(destination, file);
            copyRecursive(srcPath, destPath);
        }
    } else {
        fs.copyFileSync(source, destination);
    }
}

/**
 * Builds the extension for the specified browser
 * @param {string} browserName - Name of the browser (e.g., 'firefox', 'chrome')
 */
function buildExtension(browserName) {
    const distDir = paths.getDistDir(browserName);
    
    // Create the dist directory if it doesn't exist
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
    }
    
    // Process the manifest file
    const commonManifestPath = paths.getCommonManifestPath();
    const browserManifestPath = paths.getBrowserManifestPath(browserName);
    const targetManifestPath = paths.getTargetManifestPath(browserName);
    
    // Read common manifest
    const commonManifest = JSON.parse(fs.readFileSync(commonManifestPath, 'utf8'));
    
    // Merge with browser-specific manifest if it exists
    let finalManifest = commonManifest;
    if (fs.existsSync(browserManifestPath)) {
        const browserManifest = JSON.parse(fs.readFileSync(browserManifestPath, 'utf8'));
        finalManifest = deepMerge(commonManifest, browserManifest);
    }
    
    // Write the final manifest to the dist directory
    fs.writeFileSync(targetManifestPath, JSON.stringify(finalManifest, null, 2));
    
    // Copy all other files and directories from src to dist (except manifests)
    const entries = fs.readdirSync(paths.srcDir);
    for (const entry of entries) {
        if (entry === 'manifests') continue;
        
        const sourcePath = path.join(paths.srcDir, entry);
        const destPath = path.join(distDir, entry);
        
        copyRecursive(sourcePath, destPath);
    }
    
    console.log(`Build for ${browserName} completed successfully!`);
}

// Export the function
module.exports = buildExtension;

// Allow direct execution
if (require.main === module) {
    const browserName = process.argv[2];
    if (!browserName) {
        console.error('Please provide a browser name as an argument');
        process.exit(1);
    }
    buildExtension(browserName);
}
