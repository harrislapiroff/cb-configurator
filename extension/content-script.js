// Thin entry point for content scripts. Dynamically imports main.js as an
// ES module (content scripts can't use static imports directly).
try {
	console.log('[Caller\'s Box Configurator] Content script injected')
	const browser = globalThis.chrome ?? globalThis.browser
	const url = browser.runtime.getURL('main.js')
	console.log('[Caller\'s Box Configurator] Importing:', url)
	import(url).catch(err =>
		console.error(`[Caller's Box Configurator] Failed to load main.js: ${err.message}`)
	)
} catch (err) {
	console.error(`[Caller's Box Configurator] Content script error: ${err.message}`)
}
