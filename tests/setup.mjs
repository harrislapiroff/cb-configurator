// Test setup: provides a jsdom environment and mocks browser extension APIs
// so that main.js can be imported without crashing on init().
import { JSDOM } from 'jsdom'

// Set up a minimal browser extension API mock before any extension code loads.
// init() in main.js calls browser.storage.sync.get() at import time, so this
// needs to be in place first.
globalThis.chrome = {
	storage: {
		sync: {
			get: async () => ({}),
			onChanged: { addListener: () => {} },
		},
	},
	runtime: {
		getURL: (path) => path,
	},
}

/**
 * Create a fresh JSDOM document and install it as the global `document`.
 * Returns the window for direct access if needed.
 */
export function setupDOM(html = '<!DOCTYPE html><html><body></body></html>') {
	const dom = new JSDOM(html)
	globalThis.document = dom.window.document
	globalThis.NodeFilter = dom.window.NodeFilter
	return dom.window
}
