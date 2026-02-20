import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { setupDOM } from './setup.mjs'
import {
	replaceRoles,
	replaceChains,
	replaceDoubleGyp,
	replaceMicroNotationChoreo,
	replaceMicroNotationFormation,
	buildTerms,
	replaceAll,
	getDescendentTextNodes,
	getFormationCell,
} from '../extension/main.js'
import {
	HALF_GYP_TERMS,
	ROLE_TERMS_BIRDS,
	ROLE_TERMS_LF,
} from '../extension/maps.js'

// Helper: merge multiple term maps into one (same logic as buildTerms)
const mergeTerms = (...maps) =>
	new Map([...maps.map(m => [...m])].flat())

// ── buildTerms ──────────────────────────────────────────────────────────

describe('buildTerms', () => {
	it('includes half-gyp terms when useRSR is true', () => {
		const terms = buildTerms({ useRSR: true, roleTerms: 'mw' })
		assert.equal(terms.get('DOUBLE_TRADE'), 'quick trades')
	})

	it('excludes half-gyp terms when useRSR is false', () => {
		const terms = buildTerms({ useRSR: false, roleTerms: 'mw' })
		assert.equal(terms.has('DOUBLE_TRADE'), false)
	})

	it('includes birds role terms when roleTerms is "birds"', () => {
		const terms = buildTerms({ useRSR: false, roleTerms: 'birds' })
		assert.equal(terms.get('ROLE_R'), 'Robins')
		assert.equal(terms.get('ROLE_L'), 'Larks')
	})

	it('includes lead/follow role terms when roleTerms is "lf"', () => {
		const terms = buildTerms({ useRSR: false, roleTerms: 'lf' })
		assert.equal(terms.get('ROLE_R'), 'Follows')
		assert.equal(terms.get('ROLE_L'), 'Leads')
	})

	it('includes no role terms when roleTerms is "mw"', () => {
		const terms = buildTerms({ useRSR: false, roleTerms: 'mw' })
		assert.equal(terms.has('ROLE_R'), false)
	})
})

// ── replaceRoles ────────────────────────────────────────────────────────

describe('replaceRoles', () => {
	const terms = mergeTerms(ROLE_TERMS_BIRDS)

	beforeEach(() => {
		setupDOM(`<!DOCTYPE html><html><body>
			<a href="/glossary#men">men</a>
			<a href="/glossary#women">women</a>
		</body></html>`)
	})

	it('replaces men/women links with Larks/Robins', () => {
		replaceRoles(terms)
		const men = document.querySelector('a[href$="#men"]')
		const women = document.querySelector('a[href$="#women"]')
		assert.equal(men.textContent, 'Larks')
		assert.equal(women.textContent, 'Robins')
	})

	it('does nothing when terms has no ROLE_R key', () => {
		replaceRoles(new Map())
		const men = document.querySelector('a[href$="#men"]')
		assert.equal(men.textContent, 'men')
	})
})

// ── replaceChains ───────────────────────────────────────────────────────

describe('replaceChains', () => {
	const terms = mergeTerms(ROLE_TERMS_BIRDS)

	beforeEach(() => {
		setupDOM(`<!DOCTYPE html><html><body>
			<a href="/glossary#ladies-chain">ladies chain</a>
			<a href="/glossary#gents-chain">gents chain</a>
			<a href="/glossary#right-hand-ladies-chain">right-hand ladies chain</a>
			<a href="/glossary#grand-ladies-chain">grand ladies chain</a>
			<a href="/glossary#grand-gents-chain">grand gents chain</a>
			<a href="/glossary#open-ladies-chain">open ladies chain</a>
			<a href="/glossary#open-gents-chain">open gents chain</a>
			<a href="/glossary#three-ladies-chain">three ladies chain</a>
		</body></html>`)
	})

	it('replaces all chain variants', () => {
		replaceChains(terms)
		assert.equal(
			document.querySelector('a[href$="#ladies-chain"]').textContent,
			'Robins chain'
		)
		assert.equal(
			document.querySelector('a[href$="#gents-chain"]').textContent,
			'Larks chain'
		)
		assert.equal(
			document.querySelector('a[href$="#right-hand-ladies-chain"]').textContent,
			'right-hand chain'
		)
		assert.equal(
			document.querySelector('a[href$="#grand-ladies-chain"]').textContent,
			'Robins grand chain'
		)
		assert.equal(
			document.querySelector('a[href$="#grand-gents-chain"]').textContent,
			'Larks grand chain'
		)
		assert.equal(
			document.querySelector('a[href$="#open-ladies-chain"]').textContent,
			'Robins open chain'
		)
		assert.equal(
			document.querySelector('a[href$="#open-gents-chain"]').textContent,
			'Larks open chain'
		)
		assert.equal(
			document.querySelector('a[href$="#three-ladies-chain"]').textContent,
			'Three Robins chain'
		)
	})

	it('does nothing when terms has no CHAIN_R key', () => {
		replaceChains(new Map())
		assert.equal(
			document.querySelector('a[href$="#ladies-chain"]').textContent,
			'ladies chain'
		)
	})
})

// ── replaceDoubleGyp ────────────────────────────────────────────────────

describe('replaceDoubleGyp', () => {
	const terms = mergeTerms(HALF_GYP_TERMS)

	beforeEach(() => {
		setupDOM(`<!DOCTYPE html><html><body>
			<a href="/glossary#double-gyp">double gyp</a>
		</body></html>`)
	})

	it('replaces double-gyp with quick trades', () => {
		replaceDoubleGyp(terms)
		assert.equal(
			document.querySelector('a[href$="#double-gyp"]').textContent,
			'quick trades'
		)
	})

	it('does nothing when terms has no DOUBLE_TRADE key', () => {
		replaceDoubleGyp(new Map())
		assert.equal(
			document.querySelector('a[href$="#double-gyp"]').textContent,
			'double gyp'
		)
	})
})

// ── replaceMicroNotationChoreo ──────────────────────────────────────────

describe('replaceMicroNotationChoreo', () => {
	const terms = mergeTerms(ROLE_TERMS_BIRDS)

	beforeEach(() => {
		setupDOM(`<!DOCTYPE html><html><body>
			<div id="phrases">
				<span>MR WL M1R W2L</span>
				<span>M roll L, W side-step R</span>
			</div>
		</body></html>`)
	})

	it('replaces M/W micro-notation with role initials', () => {
		replaceMicroNotationChoreo(terms)
		const spans = document.querySelectorAll('#phrases span')
		assert.equal(spans[0].textContent, 'LR RL L1R R2L')
	})

	it('replaces M/W in roll and side-step notation', () => {
		replaceMicroNotationChoreo(terms)
		const spans = document.querySelectorAll('#phrases span')
		assert.equal(spans[1].textContent, 'L roll L, R side-step R')
	})

	it('does nothing when terms has no MICRO_L key', () => {
		replaceMicroNotationChoreo(new Map())
		const spans = document.querySelectorAll('#phrases span')
		assert.equal(spans[0].textContent, 'MR WL M1R W2L')
	})

	it('does nothing when there is no #phrases element', () => {
		setupDOM('<!DOCTYPE html><html><body></body></html>')
		// Should not throw
		replaceMicroNotationChoreo(terms)
	})
})

// ── replaceMicroNotationFormation ───────────────────────────────────────

describe('replaceMicroNotationFormation', () => {
	const terms = mergeTerms(ROLE_TERMS_BIRDS)

	beforeEach(() => {
		setupDOM(`<!DOCTYPE html><html><body>
			<table>
				<tr>
					<td>FormationDetail</td>
					<td>Wave of four (MR, WL).</td>
				</tr>
			</table>
		</body></html>`)
	})

	it('replaces M/W in formation detail cell', () => {
		replaceMicroNotationFormation(terms)
		const cell = getFormationCell()
		assert.equal(cell.textContent, 'Wave of four (LR, RL).')
	})

	it('does nothing when there is no formation cell', () => {
		setupDOM('<!DOCTYPE html><html><body></body></html>')
		// Should not throw
		replaceMicroNotationFormation(terms)
	})
})

// ── getDescendentTextNodes ──────────────────────────────────────────────

describe('getDescendentTextNodes', () => {
	beforeEach(() => {
		setupDOM(`<!DOCTYPE html><html><body>
			<div id="target">Hello <span>nested <b>deep</b></span> world</div>
		</body></html>`)
	})

	it('returns all text nodes in an element', () => {
		const target = document.getElementById('target')
		const nodes = getDescendentTextNodes(target)
		const texts = nodes.map(n => n.textContent.trim()).filter(Boolean)
		assert.deepEqual(texts, ['Hello', 'nested', 'deep', 'world'])
	})
})

// ── getFormationCell ────────────────────────────────────────────────────

describe('getFormationCell', () => {
	it('returns the cell after FormationDetail', () => {
		setupDOM(`<!DOCTYPE html><html><body>
			<table><tr>
				<td>FormationDetail</td>
				<td>Improper</td>
			</tr></table>
		</body></html>`)
		const cell = getFormationCell()
		assert.equal(cell.textContent, 'Improper')
	})

	it('returns undefined when no FormationDetail cell exists', () => {
		setupDOM('<!DOCTYPE html><html><body></body></html>')
		assert.equal(getFormationCell(), undefined)
	})
})

// ── replaceAll (integration) ────────────────────────────────────────────

describe('replaceAll', () => {
	beforeEach(() => {
		setupDOM(`<!DOCTYPE html><html><body>
			<div id="phrases">
				<a href="/glossary#men">men</a>
				<a href="/glossary#women">women</a>
				<a href="/glossary#ladies-chain">ladies chain</a>
				<a href="/glossary#double-gyp">double gyp</a>
				<span>MR WL</span>
			</div>
			<table><tr>
				<td>FormationDetail</td>
				<td>Wave (MR, WL).</td>
			</tr></table>
		</body></html>`)
	})

	it('replaces all terms with birds options', () => {
		replaceAll({ enabled: true, useRSR: true, roleTerms: 'birds' })
		assert.equal(
			document.querySelector('a[href$="#men"]').textContent,
			'Larks'
		)
		assert.equal(
			document.querySelector('a[href$="#women"]').textContent,
			'Robins'
		)
		assert.equal(
			document.querySelector('a[href$="#ladies-chain"]').textContent,
			'Robins chain'
		)
		assert.equal(
			document.querySelector('a[href$="#double-gyp"]').textContent,
			'quick trades'
		)
	})

	it('replaces all terms with lead/follow options', () => {
		replaceAll({ enabled: true, useRSR: true, roleTerms: 'lf' })
		assert.equal(
			document.querySelector('a[href$="#men"]').textContent,
			'Leads'
		)
		assert.equal(
			document.querySelector('a[href$="#women"]').textContent,
			'Follows'
		)
	})

	it('does nothing when disabled', () => {
		replaceAll({ enabled: false, useRSR: true, roleTerms: 'birds' })
		assert.equal(
			document.querySelector('a[href$="#men"]').textContent,
			'men'
		)
	})
})
