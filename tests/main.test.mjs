import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { setupDOM } from './setup.mjs'
import {
	replaceRoles,
	replaceChains,
	replaceDoubleGyp,
	replaceMicroNotationChoreo,
	replaceMicroNotationFormation,
	replaceRoleTextInPhrases,
	replaceVariantVideos,
	replaceCallingNotes,
	buildTerms,
	replaceAll,
	getDescendentTextNodes,
	getFormationCell,
	getVariantVideosCell,
	getCallingNotesContainer,
	matchCapitalization,
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

// ── matchCapitalization ──────────────────────────────────────────────────

describe('matchCapitalization', () => {
	it('returns replacement ALL CAPS when original is ALL CAPS', () => {
		assert.equal(matchCapitalization('MEN', 'Larks'), 'LARKS')
		assert.equal(matchCapitalization('WOMEN', 'Robins'), 'ROBINS')
	})

	it('returns replacement with leading capital when original is title case', () => {
		assert.equal(matchCapitalization('Men', 'Larks'), 'Larks')
		assert.equal(matchCapitalization('Man', 'Lark'), 'Lark')
	})

	it('returns replacement lowercase when original is all lowercase', () => {
		assert.equal(matchCapitalization('men', 'Larks'), 'larks')
		assert.equal(matchCapitalization('man', 'Lark'), 'lark')
		assert.equal(matchCapitalization('women', 'Robins'), 'robins')
		assert.equal(matchCapitalization('woman', 'Robin'), 'robin')
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

// ── replaceRoleTextInPhrases ─────────────────────────────────────────────

describe('replaceRoleTextInPhrases', () => {
	const terms = mergeTerms(ROLE_TERMS_BIRDS)

	beforeEach(() => {
		setupDOM(`<!DOCTYPE html><html><body>
			<div id="phrases">
				<p>Man one right hand high || Man two turn alone</p>
				<p>Woman one and man two arch, man one and woman two dive</p>
				<p>men walk forward; women balance</p>
			</div>
		</body></html>`)
	})

	it('replaces singular man/woman with Lark/Robin, preserving capitalization', () => {
		replaceRoleTextInPhrases(terms)
		const paras = document.querySelectorAll('#phrases p')
		// "Man"/"Woman" (title case) → "Lark"/"Robin"; "man"/"woman" (lowercase) → "lark"/"robin"
		assert.equal(paras[0].textContent, 'Lark one right hand high || Lark two turn alone')
		assert.equal(paras[1].textContent, 'Robin one and lark two arch, lark one and robin two dive')
	})

	it('replaces plural men/women with Larks/Robins, preserving capitalization', () => {
		replaceRoleTextInPhrases(terms)
		const paras = document.querySelectorAll('#phrases p')
		// "men"/"women" (all lowercase) → "larks"/"robins"
		assert.equal(paras[2].textContent, 'larks walk forward; robins balance')
	})

	it('replaces ALL CAPS MEN/WOMEN with ALL CAPS replacement', () => {
		setupDOM(`<!DOCTYPE html><html><body>
			<div id="phrases"><p>MEN on the left, WOMEN on the right</p></div>
		</body></html>`)
		replaceRoleTextInPhrases(terms)
		const para = document.querySelector('#phrases p')
		assert.equal(para.textContent, 'LARKS on the left, ROBINS on the right')
	})

	it('does not replace substrings (e.g. promenade)', () => {
		setupDOM(`<!DOCTYPE html><html><body>
			<div id="phrases"><p>promenade; cement men</p></div>
		</body></html>`)
		replaceRoleTextInPhrases(terms)
		const para = document.querySelector('#phrases p')
		assert.equal(para.textContent, 'promenade; cement larks')
	})

	it('does nothing when terms has no ROLE_L key', () => {
		replaceRoleTextInPhrases(new Map())
		const para = document.querySelector('#phrases p')
		assert.equal(para.textContent, 'Man one right hand high || Man two turn alone')
	})

	it('does nothing when there is no #phrases element', () => {
		setupDOM('<!DOCTYPE html><html><body></body></html>')
		// Should not throw
		replaceRoleTextInPhrases(terms)
	})
})

// ── replaceRoleTextInPhrases – ladies/gents ──────────────────────────────

describe('replaceRoleTextInPhrases – ladies/gents', () => {
	const terms = mergeTerms(ROLE_TERMS_BIRDS)

	it('replaces ladies/gents with role terms, preserving capitalization', () => {
		setupDOM(`<!DOCTYPE html><html><body>
			<div id="phrases">
				<p>Ladies go first; gents follow</p>
				<p>Lady one and gent two swing</p>
			</div>
		</body></html>`)
		replaceRoleTextInPhrases(terms)
		const paras = document.querySelectorAll('#phrases p')
		assert.equal(paras[0].textContent, 'Robins go first; larks follow')
		assert.equal(paras[1].textContent, 'Robin one and lark two swing')
	})

	it('does not replace ladies/gents inside other words', () => {
		setupDOM(`<!DOCTYPE html><html><body>
			<div id="phrases"><p>agents ladybird</p></div>
		</body></html>`)
		replaceRoleTextInPhrases(terms)
		const para = document.querySelector('#phrases p')
		assert.equal(para.textContent, 'agents ladybird')
	})
})

// ── getCallingNotesContainer ────────────────────────────────────────────

describe('getCallingNotesContainer', () => {
	it('returns the parent element of the Calling Notes heading', () => {
		setupDOM(`<!DOCTYPE html><html><body>
			<div class="box"><h2>Calling Notes:</h2><p>Some notes here.</p></div>
		</body></html>`)
		const container = getCallingNotesContainer()
		assert.ok(container)
		assert.equal(container.tagName, 'DIV')
		assert.ok(container.textContent.includes('Some notes here.'))
	})

	it('returns null when no Calling Notes heading exists', () => {
		setupDOM('<!DOCTYPE html><html><body></body></html>')
		assert.equal(getCallingNotesContainer(), null)
	})
})

// ── replaceCallingNotes ─────────────────────────────────────────────────

describe('replaceCallingNotes', () => {
	const terms = mergeTerms(ROLE_TERMS_BIRDS)

	beforeEach(() => {
		setupDOM(`<!DOCTYPE html><html><body>
			<div class="box">
				<h2>Calling Notes:</h2>
				The women go in first. The men follow.<br>
				Everyone ends in the spot of their opposite gendered neighbor,
				having gone around the spot of their same gendered neighbor.<br>
				Same gender pairs face across. Opposite gender pairs face along.<br>
				The lady leads the gent through the arch.
			</div>
		</body></html>`)
	})

	it('replaces men/women with role terms', () => {
		replaceCallingNotes(terms)
		const container = getCallingNotesContainer()
		assert.ok(container.textContent.includes('robins go in first'))
		assert.ok(container.textContent.includes('larks follow'))
	})

	it('replaces ladies/gents with role terms', () => {
		replaceCallingNotes(terms)
		const container = getCallingNotesContainer()
		assert.ok(container.textContent.includes('robin leads the lark'))
	})

	it('replaces "opposite gendered" with "opposite role"', () => {
		replaceCallingNotes(terms)
		const container = getCallingNotesContainer()
		assert.ok(container.textContent.includes('opposite role neighbor'))
		assert.ok(!container.textContent.includes('opposite gendered'))
	})

	it('replaces "same gendered" with "same role"', () => {
		replaceCallingNotes(terms)
		const container = getCallingNotesContainer()
		assert.ok(container.textContent.includes('same role neighbor'))
		assert.ok(!container.textContent.includes('same gendered'))
	})

	it('replaces "same gender" (without -ed) with "same role"', () => {
		replaceCallingNotes(terms)
		const container = getCallingNotesContainer()
		assert.ok(container.textContent.includes('Same role pairs face across'))
	})

	it('replaces "opposite gender" (without -ed) with "opposite role"', () => {
		replaceCallingNotes(terms)
		const container = getCallingNotesContainer()
		assert.ok(container.textContent.includes('Opposite role pairs face along'))
	})

	it('does nothing when terms has no ROLE_L key', () => {
		replaceCallingNotes(new Map())
		const container = getCallingNotesContainer()
		assert.ok(container.textContent.includes('women'))
		assert.ok(container.textContent.includes('opposite gendered'))
	})

	it('does nothing when there is no Calling Notes section', () => {
		setupDOM('<!DOCTYPE html><html><body></body></html>')
		// Should not throw
		replaceCallingNotes(terms)
	})
})

// ── getVariantVideosCell ─────────────────────────────────────────────────

describe('getVariantVideosCell', () => {
	it('returns the cell after VariantVideos', () => {
		setupDOM(`<!DOCTYPE html><html><body>
			<table><tr>
				<td>VariantVideos:</td>
				<td>A2: Men allemande left 3/4</td>
			</tr></table>
		</body></html>`)
		const cell = getVariantVideosCell()
		assert.equal(cell.textContent, 'A2: Men allemande left 3/4')
	})

	it('returns undefined when no VariantVideos cell exists', () => {
		setupDOM('<!DOCTYPE html><html><body></body></html>')
		assert.equal(getVariantVideosCell(), undefined)
	})
})

// ── replaceVariantVideos ──────────────────────────────────────────────────

describe('replaceVariantVideos', () => {
	const terms = mergeTerms(ROLE_TERMS_BIRDS)

	beforeEach(() => {
		setupDOM(`<!DOCTYPE html><html><body>
			<table><tr>
				<td>VariantVideos:</td>
				<td><div>A2: Men allemande left 3/4; neighbor swing<br></div>
				<div>B1: Men pull by left; partner swing<br></div></td>
			</tr></table>
		</body></html>`)
	})

	it('replaces men/women in VariantVideos cell text', () => {
		replaceVariantVideos(terms)
		const cell = getVariantVideosCell()
		const divs = cell.querySelectorAll('div')
		assert.equal(divs[0].textContent.trim(), 'A2: Larks allemande left 3/4; neighbor swing')
		assert.equal(divs[1].textContent.trim(), 'B1: Larks pull by left; partner swing')
	})

	it('does nothing when terms has no ROLE_L key', () => {
		replaceVariantVideos(new Map())
		const cell = getVariantVideosCell()
		const div = cell.querySelector('div')
		assert.ok(div.textContent.includes('Men'))
	})

	it('does nothing when there is no VariantVideos cell', () => {
		setupDOM('<!DOCTYPE html><html><body></body></html>')
		// Should not throw
		replaceVariantVideos(terms)
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
				<p>Man one arch; woman two dive</p>
			</div>
			<table>
			<tr>
				<td>FormationDetail</td>
				<td>Wave (MR, WL).</td>
			</tr>
			<tr>
				<td>VariantVideos:</td>
				<td>A2: Men allemande left 3/4</td>
			</tr>
			</table>
			<div class="box">
				<h2>Calling Notes:</h2>
				The women go first. Opposite gendered neighbors swap.
			</div>
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
		assert.equal(
			document.querySelector('#phrases p').textContent,
			'Lark one arch; robin two dive'
		)
		assert.equal(
			getVariantVideosCell().textContent,
			'A2: Larks allemande left 3/4'
		)
		const callingNotes = getCallingNotesContainer()
		assert.ok(callingNotes.textContent.includes('robins go first'))
		assert.ok(callingNotes.textContent.includes('Opposite role neighbors'))
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
