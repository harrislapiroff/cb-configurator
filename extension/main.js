import {
	HALF_GYP_TERMS,
	ROLE_TERMS_BIRDS,
	ROLE_TERMS_LF,
} from './maps.js'

const log = (str) => console?.log(`[Caller's Box Configurator] ${str}`)

log("Running")

const browser = globalThis.chrome ?? globalThis.browser

const getOptions = async () => {
	const data = await browser.storage.sync.get([
		'enabled',
		'useRSR',
		'roleTerms',
	])
	if (data.enabled === undefined) data.enabled = true
	if (data.useRSR === undefined) data.useRSR = true
	if (data.roleTerms === undefined) data.roleTerms = 'birds'
	return data
}

export const getDescendentTextNodes = el => {
	const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false)
	const nodes = []
	while (walker.nextNode()) {
		nodes.push(walker.currentNode)
	}
	return nodes
}

export const getFormationCell = () => {
	return Array.from(document.querySelectorAll('td'))
		.find(cell => cell.textContent.includes('FormationDetail'))
		?.nextElementSibling
}

export const replaceTerm = (termMap) => (key) => (el) => el.textContent = termMap.get(key)

export const replaceRoles = (terms) => {
	if (!terms.has('ROLE_R')) return

	// Note: replaceRoleTextInPhrases also substitutes "men"/"women" text
	// within #phrases via word-boundary regex, so there is some overlap here
	// for glossary links that sit inside #phrases. replaceRoles is kept because
	// it covers the whole document (links outside #phrases) and works by
	// selector rather than text content, making it more robust to unusual link
	// text that word-boundary matching would miss.
	const term = replaceTerm(terms)
	document.querySelectorAll('a[href$="#men"]')
		.forEach(term('ROLE_L'))
	document.querySelectorAll('a[href$="#women"]')
		.forEach(term('ROLE_R'))
}

export const replaceChains = (terms) => {
	if (!terms.has('CHAIN_R')) return

	const term = replaceTerm(terms)
	// Turns out there's a lot of kinds of chains
	// and they all have role terms in them!
	document.querySelectorAll('a[href$="#ladies-chain"]')
		.forEach(term('CHAIN_R'))
	document.querySelectorAll('a[href$="#gents-chain"]')
		.forEach(term('CHAIN_L'))
	document.querySelectorAll('a[href$="#right-hand-ladies-chain"]')
		.forEach(term('CHAIN_R_BY_L'))
	document.querySelectorAll('a[href$="#grand-ladies-chain"]')
		.forEach(term('GRAND_CHAIN_R'))
	document.querySelectorAll('a[href$="#grand-gents-chain"]')
		.forEach(term('GRAND_CHAIN_L'))
	document.querySelectorAll('a[href$="#open-ladies-chain"]')
		.forEach(term('OPEN_CHAIN_R'))
	document.querySelectorAll('a[href$="#open-gents-chain"]')
		.forEach(term('OPEN_CHAIN_L'))
	document.querySelectorAll('a[href$="#three-ladies-chain"]')
		.forEach(term('THREE_CHAIN_R'))
}

export const replaceDoubleGyp = (terms) => {
	if (!terms.has('DOUBLE_TRADE')) return

	const term = replaceTerm(terms)
	document.querySelectorAll('a[href$="#double-gyp"]')
		.forEach(term('DOUBLE_TRADE'))
}

export const replaceMicroNotationChoreo = (terms) => {
	if (!terms.has('MICRO_L')) return

	// Replacing micro notation is also a little tricky. It isn't wrapped in
	// glossary links, so we need to search every node for text that looks like
	// a micro notation and replace it.
	//
	// Honestly, it's possibly more of our substitutions should take this
	// approach... but that's a consideration for later.
	const phrasesEl = document.getElementById('phrases')
	if (!phrasesEl) return
	const choreoTextNodes = getDescendentTextNodes(phrasesEl)
	choreoTextNodes.forEach(node => {
		// We're trying to capture any two character sequences that look like:
		//    MR, LL, M1, R2, etc.
		// As well as three character sequences
		//    M1R, L2L, etc.
		node.textContent = node.textContent
			.replace(/M([LR0-9][RL]?)/g, `${terms.get('MICRO_L')}$1`)
			.replace(/W([LR0-9][RL]?)/g, `${terms.get('MICRO_R')}$1`)
			// We also need to capture cases like "roll away (W roll L, M side-step R"
			.replace(/M (roll|side-step) ([LR])/g, `${terms.get('MICRO_L')} $1 $2`)
			.replace(/W (roll|side-step) ([LR])/g, `${terms.get('MICRO_R')} $1 $2`)
	})
}

export const replaceMicroNotationFormation = (terms) => {
	if (!terms.has('MICRO_L')) return

	// We also need to replace the micro notation in Formation Detail table
	// for cases like "Wave of four (NR, WL)." Unfortunately there's no CSS
	// selector for this task.
	const formationDetailValCell = getFormationCell()

	if (!formationDetailValCell) return

	const formationTextNodes = getDescendentTextNodes(formationDetailValCell)
	formationTextNodes.forEach(node => {
		node.textContent = node.textContent
			.replace(/M([LR0-9][RL]?)/g, `${terms.get('MICRO_L')}$1`)
			.replace(/W([LR0-9][RL]?)/g, `${terms.get('MICRO_R')}$1`)
	})

}

// Apply the capitalization style of `original` to `replacement`.
// Handles three cases: ALL CAPS ("MEN" → "LARKS"), Title case ("Men" → "Larks"),
// and all-lowercase ("men" → "larks").
export const matchCapitalization = (original, replacement) => {
	if (original === original.toUpperCase()) return replacement.toUpperCase()
	if (original[0] === original[0].toUpperCase()) {
		return replacement[0].toUpperCase() + replacement.slice(1)
	}
	return replacement.toLowerCase()
}

// Replace plain-text occurrences of gendered role words (man/woman/men/women
// and lady/gent/ladies/gents) in a list of text nodes. Uses word boundaries so
// "promenade" is not affected, and preserves the capitalization style of each
// matched word.
const replaceGenderedWordsInNodes = (nodes, terms) => {
	nodes.forEach(node => {
		node.textContent = node.textContent
			.replace(/\bwomen\b/gi, (m) => matchCapitalization(m, terms.get('ROLE_R')))
			.replace(/\bwoman\b/gi, (m) => matchCapitalization(m, terms.get('ROLE_R_S')))
			.replace(/\bladies\b/gi, (m) => matchCapitalization(m, terms.get('ROLE_R')))
			.replace(/\blady\b/gi, (m) => matchCapitalization(m, terms.get('ROLE_R_S')))
			.replace(/\bmen\b/gi, (m) => matchCapitalization(m, terms.get('ROLE_L')))
			.replace(/\bman\b/gi, (m) => matchCapitalization(m, terms.get('ROLE_L_S')))
			.replace(/\bgents\b/gi, (m) => matchCapitalization(m, terms.get('ROLE_L')))
			.replace(/\bgent\b/gi, (m) => matchCapitalization(m, terms.get('ROLE_L_S')))
	})
}

export const replaceRoleTextInPhrases = (terms) => {
	if (!terms.has('ROLE_L')) return

	// Some dances refer to specific dancers by name in plain text rather than
	// glossary links, e.g. "Man one right hand high || Man two turn alone" or
	// "Woman one and man two arch." These aren't wrapped in #men/#women links,
	// so we walk all text nodes in #phrases and do word-boundary replacements.
	const phrasesEl = document.getElementById('phrases')
	if (!phrasesEl) return
	const textNodes = getDescendentTextNodes(phrasesEl)
	replaceGenderedWordsInNodes(textNodes, terms)
}

export const getVariantVideosCell = () => {
	return Array.from(document.querySelectorAll('td'))
		.find(cell => cell.textContent.includes('VariantVideos'))
		?.nextElementSibling
}

export const replaceVariantVideos = (terms) => {
	if (!terms.has('ROLE_L')) return

	// The VariantVideos field contains plain-text descriptions of dance
	// variations, e.g. "A2: Men allemande left 3/4; neighbor swing."
	// These are not glossary links so we use word-boundary text replacement.
	const cell = getVariantVideosCell()
	if (!cell) return
	const textNodes = getDescendentTextNodes(cell)
	replaceGenderedWordsInNodes(textNodes, terms)
}

export const getCallingNotesContainer = () => {
	for (const h of document.querySelectorAll('h2')) {
		if (h.textContent.includes('Calling Notes')) {
			return h.parentElement
		}
	}
	return null
}

// Replace "same gender"/"same gendered" → "same role" and
// "opposite gender"/"opposite gendered" → "opposite role" in a list of text
// nodes, preserving the capitalization of the matched phrase.
const replaceGenderPhrasesInNodes = (nodes) => {
	nodes.forEach(node => {
		node.textContent = node.textContent
			.replace(/\bsame gender(?:ed)?\b/gi, (m) => matchCapitalization(m, 'same role'))
			.replace(/\bopposite gender(?:ed)?\b/gi, (m) => matchCapitalization(m, 'opposite role'))
	})
}

export const replaceCallingNotes = (terms) => {
	if (!terms.has('ROLE_L')) return

	const container = getCallingNotesContainer()
	if (!container) return
	const textNodes = getDescendentTextNodes(container)
	replaceGenderedWordsInNodes(textNodes, terms)
	replaceGenderPhrasesInNodes(textNodes)
}

export const buildTerms = (options) => {
	const termMaps = []
	if (options.useRSR) termMaps.push(HALF_GYP_TERMS)
	if (options.roleTerms === 'birds') termMaps.push(ROLE_TERMS_BIRDS)
	if (options.roleTerms === 'lf') termMaps.push(ROLE_TERMS_LF)
	return new Map([...termMaps.map(map => [...map])].flat())
}

export const replaceAll = (options) => {
	if (!options.enabled) return
	log("Replacing terms")
	const terms = buildTerms(options)
	replaceRoles(terms)
	replaceChains(terms)
	replaceDoubleGyp(terms)
	replaceMicroNotationChoreo(terms)
	replaceMicroNotationFormation(terms)
	replaceRoleTextInPhrases(terms)
	replaceVariantVideos(terms)
	replaceCallingNotes(terms)
}

// Instantiation (only runs in extension context):
const init = async () => {
	const options = await getOptions()

	// Save the original HTML so we can undo this later
	const phrasesEl = document.getElementById('phrases')
	if (!phrasesEl) {
		log("No #phrases element found, skipping")
		return
	}
	const phrasesTableHTML = phrasesEl.innerHTML
	const formationValueCellHTML = Array.from(document.querySelectorAll('td'))
		.find(cell => cell.textContent.includes('FormationDetail'))
		?.nextElementSibling?.innerHTML
	const variantVideosCellHTML = getVariantVideosCell()?.innerHTML
	const callingNotesContainerHTML = getCallingNotesContainer()?.innerHTML

	const revert = () => {
		document.getElementById('phrases').innerHTML = phrasesTableHTML
		const formationCell = getFormationCell()
		if (formationCell) formationCell.innerHTML = formationValueCellHTML
		const variantVideosCell = getVariantVideosCell()
		if (variantVideosCell) variantVideosCell.innerHTML = variantVideosCellHTML
		const callingNotesContainer = getCallingNotesContainer()
		if (callingNotesContainer) callingNotesContainer.innerHTML = callingNotesContainerHTML
	}

	// When options change, rerender
	browser.storage.sync.onChanged.addListener(async () => {
		const newOptions = await getOptions()
		log("Options changed, updating")
		revert()
		replaceAll(newOptions)
	})

	replaceAll(options)
}

init().catch(err => log(`Error: ${err.message}`))
