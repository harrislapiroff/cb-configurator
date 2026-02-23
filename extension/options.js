const browser = globalThis.chrome ?? globalThis.browser

class OptionsForm extends HTMLElement {
	_options = [
		{ key: 'enabled', type: 'checkbox', default_: true },
		{ key: 'useRSR', type: 'checkbox', default_: true },
		{ key: 'roleTerms', type: 'text', default_: 'birds' },
	]

	connectedCallback() {
		this.form = this.querySelector('form')
		this.restoreOptions()
		this.form.addEventListener('input', () => {
			this.saveOptions()
			this.updateEnabledState()
		})
	}

	async restoreOptions() {
		const keys = this._options.map(({ key }) => key)
		const data = await browser.storage.sync.get(keys)
		this._options.forEach(({ key, type, default_ }) => {
			const value = (data[key] === undefined) ? default_ : data[key]
			const el = this.form.querySelector(`[name=${key}]`)
			if (type === 'checkbox') {
				el.checked = value
			} else {
				el.value = value
			}
		})
		this.updateEnabledState()
	}

	updateEnabledState() {
		const enabled = this.form.querySelector('[name=enabled]').checked
		this.form.querySelector('[name=useRSR]').disabled = !enabled
		this.form.querySelector('[name=roleTerms]').disabled = !enabled
	}

	async saveOptions() {
		const data = this._options.map(({ key, type }) => {
			const el = this.form.querySelector(`[name=${key}]`)
			const value = type === 'checkbox' ? el.checked : el.value
			return [key, value]
		})
		await browser.storage.sync.set(Object.fromEntries(data))
	}
}

customElements.define('cb-options-form', OptionsForm)

// Permission check — Safari (and some MV3 browsers) require explicit user
// grants for content script host access. Show a banner when not yet granted.
//
// Check the exact pattern from content_scripts.matches so that Chrome (which
// implicitly grants it) returns true and avoids showing the banner needlessly.
// Request the broader pattern declared in optional_host_permissions.
const CONTENT_SCRIPT_ORIGINS = ['*://*.ibiblio.org/contradance/thecallersbox/*']
const REQUEST_ORIGINS = ['*://*.ibiblio.org/*']
const permissionsBanner = document.getElementById('permissions-banner')
const grantAccessBtn = document.getElementById('grant-access')

if (permissionsBanner && grantAccessBtn) {
	browser.permissions.contains({ origins: CONTENT_SCRIPT_ORIGINS })
		.then(granted => { permissionsBanner.hidden = granted })
		.catch(() => { permissionsBanner.hidden = true })

	// Call permissions.request() synchronously in the click handler —
	// an async gap before this call would lose the user-gesture context.
	grantAccessBtn.addEventListener('click', () => {
		browser.permissions.request({ origins: REQUEST_ORIGINS })
			.then(granted => {
				if (granted) {
					permissionsBanner.hidden = true
					// Reload the active tab so the content script runs
					// on the already-loaded page.
					if (browser.tabs) {
						browser.tabs.query({ active: true, currentWindow: true })
							.then(tabs => {
								if (tabs[0]) browser.tabs.reload(tabs[0].id)
							})
							.catch(() => {})
					}
				}
			})
			.catch(() => {})
	})
}
