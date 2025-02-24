const browser = chrome || browser

class OptionsForm extends HTMLElement {
	_options = [
		{ key: 'enabled', type: 'checkbox', default_: true },
		{ key: 'useRSR', type: 'checkbox', default_: true },
		{ key: 'roleTerms', type: 'text', default_: 'birds' },
	]

	connectedCallback() {
		this.form = this.querySelector('form')
		this.restoreOptions()
		this.form.addEventListener('input', this.saveOptions.bind(this))
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
