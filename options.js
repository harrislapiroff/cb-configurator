const browser = chrome || browser

class OptionsForm extends HTMLElement {
	_options = [
		{ key: 'enabled', type: 'checkbox', default: true },
		{ key: 'useRSR', type: 'checkbox', default: true },
		{ key: 'roleTerms', type: 'text', default: 'birds' },
	]

	connectedCallback() {
		this.form = this.querySelector('form')
		this.restoreOptions()
		this.form.addEventListener('input', this.saveOptions.bind(this))
	}

	async restoreOptions() {
		const data = await browser.storage.sync.get(this._options_keys)
		this._options.forEach(({ key, type }) => {
			const value = data[key]
			const el = this.form.querySelector(`[name=${key}]`)
			if (type === 'checkbox') {
				el.checked = value
			} else {
				el.value = value
			}
		})
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
