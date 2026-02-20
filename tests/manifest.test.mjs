import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const extDir = join(__dirname, '..', 'extension')
const manifest = JSON.parse(readFileSync(join(extDir, 'manifest.json'), 'utf8'))

describe('manifest.json', () => {
	it('is valid JSON with required MV3 fields', () => {
		assert.equal(manifest.manifest_version, 3)
		assert.ok(manifest.name)
		assert.ok(manifest.version)
	})

	it('references content script files that exist', () => {
		for (const cs of manifest.content_scripts) {
			for (const jsFile of cs.js) {
				const filePath = join(extDir, jsFile)
				assert.ok(
					existsSync(filePath),
					`Content script file missing: ${jsFile}`
				)
			}
		}
	})

	it('references icon files that exist', () => {
		for (const size of Object.keys(manifest.icons)) {
			const filePath = join(extDir, manifest.icons[size])
			assert.ok(
				existsSync(filePath),
				`Icon file missing: ${manifest.icons[size]}`
			)
		}
	})

	it('references the options page file that exists', () => {
		const filePath = join(extDir, manifest.options_ui.page)
		assert.ok(
			existsSync(filePath),
			`Options page missing: ${manifest.options_ui.page}`
		)
	})

	it('does not use "type": "module" in content_scripts (unsupported)', () => {
		for (const cs of manifest.content_scripts) {
			assert.equal(
				cs.type,
				undefined,
				'content_scripts "type": "module" is not supported by browsers; ' +
				'use dynamic import() in the content script instead'
			)
		}
	})

	it('references web_accessible_resources files that exist', () => {
		for (const entry of manifest.web_accessible_resources ?? []) {
			for (const resource of entry.resources) {
				const filePath = join(extDir, resource)
				assert.ok(
					existsSync(filePath),
					`Web-accessible resource missing: ${resource}`
				)
			}
		}
	})

	it('content script entry point does not use static import syntax', () => {
		for (const cs of manifest.content_scripts) {
			for (const jsFile of cs.js) {
				const source = readFileSync(join(extDir, jsFile), 'utf8')
				assert.ok(
					!/^\s*import\s.+from\s/m.test(source),
					`${jsFile} uses static import syntax, which is not supported ` +
					'in content scripts. Use dynamic import() instead.'
				)
			}
		}
	})
})
