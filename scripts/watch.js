const fs = require('fs');
const { exec } = require('child_process');
const buildExtension = require('./utils');
const paths = require('./paths');

// Watch for changes in the src directory
fs.watch(paths.srcDir, { recursive: true }, (eventType, filename) => {
    if (filename) {
        console.log(`${filename} file Changed`);
        
        // Rebuild the extension for each browser
        paths.browsers.forEach(browser => {
            buildExtension(browser);
        });
    }
});

console.log(`Watching for file changes in ${paths.srcDir}...`);
