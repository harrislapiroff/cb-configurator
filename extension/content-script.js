// Thin entry point for content scripts. Dynamically imports main.js as an
// ES module (content scripts can't use static imports directly).
const browser = globalThis.chrome ?? globalThis.browser
import(browser.runtime.getURL('main.js')).catch(err =>
	console.error(`[Caller's Box Configurator] Failed to load main.js: ${err.message}`)
)
