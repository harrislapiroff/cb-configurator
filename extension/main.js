// This script relies on maps.js loading first
// and populating the global namespace

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

const getDescendentTextNodes = el => {
	const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false)
	const nodes = []
	while (walker.nextNode()) {
		nodes.push(walker.currentNode)
	}
	return nodes
}

const getFormationCell = () => {
	return Array.from(document.querySelectorAll('td'))
		.find(cell => cell.textContent.includes('FormationDetail'))
		?.nextElementSibling
}

const replaceTerm = (termMap) => (key) => (el) => el.textContent = termMap.get(key)

const replaceRoles = (terms) => {
	if (!terms.has('ROLE_R')) return

	const term = replaceTerm(terms)
	document.querySelectorAll('a[href$="#men"]')
		.forEach(term('ROLE_L'))
	document.querySelectorAll('a[href$="#women"]')
		.forEach(term('ROLE_R'))
}

const replaceChains = (terms) => {
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

const replaceDoubleGyp = (terms) => {
	if (!terms.has('DOUBLE_TRADE')) return
	
	const term = replaceTerm(terms)
	document.querySelectorAll('a[href$="#double-gyp"]')
		.forEach(term('DOUBLE_TRADE'))
}

const replaceMicroNotationChoreo = (terms) => {
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

const replaceMicroNotationFormation = (terms) => {
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

// Instantiation:
const init = async () => {
	// Get initial options
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
	
	const replaceAll = (options) => {
		if (!options.enabled) return

		log("Replacing terms")

		const termMaps = []
		if (options.useRSR) termMaps.push(HALF_GYP_TERMS)
		if (options.roleTerms === 'birds') termMaps.push(ROLE_TERMS_BIRDS)
		if (options.roleTerms === 'lf') termMaps.push(ROLE_TERMS_LF)

		const terms = new Map([...termMaps.map(map => [...map])].flat())

		replaceRoles(terms)
		replaceChains(terms)
		replaceDoubleGyp(terms)
		replaceMicroNotationChoreo(terms)
		replaceMicroNotationFormation(terms)
	}

	const revert = () => {
		document.getElementById('phrases').innerHTML = phrasesTableHTML
		const formationCell = getFormationCell()
		if (formationCell) formationCell.innerHTML = formationValueCellHTML
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
