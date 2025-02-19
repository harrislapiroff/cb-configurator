console.log("[Caller's Box Term Changer] Running")

const TERMS = new Map([
    ['ROLE_R', 'Robins'],
    ['ROLE_L', 'Larks'],
    ['CHAIN_R', 'Robins chain'],
    ['CHAIN_L', 'Larks chain'],
    ['RSR', 'right shoulder round'],
    ['LSR', 'left shoulder round'],
    // Single initials for micro-notation, such as in hey or waves descriptions
    ['MICRO_R', 'R'],
    ['MICRO_L', 'L'],
])

const getDescendentTextNodes = el => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false)
    const nodes = []
    while (walker.nextNode()) {
        nodes.push(walker.currentNode)
    }
    return nodes
}

const replaceTerm = (key) => (el) => el.textContent = TERMS.get(key)

const replaceRoles = () => {
    document.querySelectorAll('a[href$="#men"]')
        .forEach(replaceTerm('ROLE_L'))
    document.querySelectorAll('a[href$="#women"]')
        .forEach(replaceTerm('ROLE_R'))
}

const replaceChains = () => {
    document.querySelectorAll('a[href$="#ladies-chain"]')
        .forEach(replaceTerm('CHAIN_R'))
    document.querySelectorAll('a[href$="#gents-chain"]')
        .forEach(replaceTerm('CHAIN_L'))
}

const replaceShoulderRounds = () => {
    // Replacing gypsy is a little trickier since in Caller's Box
    // the figure is notated, e.g.,
    //     `<a href="...">gypsy</a> right`
    // and we want to replace it with
    //     `<a href="...">right shoulder round</a>`

    document.querySelectorAll('a[href$="#gypsy"]').forEach(element => {
        // We need the next node (should be a text node starting with "right" or
        // "left") for a couple purposes
        const nextSibling = element.nextSibling
        // Get the direction of the shoulder round by checking the next word
        const direction = nextSibling.textContent.trim().split(' ')[0]
        // Remove that word from the next node 
        nextSibling.textContent = nextSibling.textContent.replace(direction, '')
        // Replace the term
        const term = direction === 'right' ? 'RSR' : 'LSR'
        element.textContent = TERMS.get(term)
    })
}

const replaceMicroNotationChoreo = () => {
    // Replacing micro notation is also a little tricky. It isn't wrapped in
    // glossary links, so we need to search every node for text that looks like
    // a micro notation and replace it.
    //
    // Honestly, it's possibly more of our substitutions should take this
    // approach... but that's a consideration for later.
    const choreoTextNodes = getDescendentTextNodes(document.getElementById('phrases'))
    choreoTextNodes.forEach(node => {
        // We're trying to capture any two character sequences that look like:
        //    MR, LL, M1, R2, etc.
        // As well as three character sequences
        //    M1R, L2L, etc.
        node.textContent = node.textContent
            .replace(/M([LR0-9][RL]?)/g, `${TERMS.get('MICRO_L')}$1`)
            .replace(/W([LR0-9][RL]?)/g, `${TERMS.get('MICRO_R')}$1`)
            // We also need to capture cases like "roll away (W roll L, M side-step R"
            .replace(/M (roll|side-step) ([LR])/g, `${TERMS.get('MICRO_L')} $1 $2`)
            .replace(/W (roll|side-step) ([LR])/g, `${TERMS.get('MICRO_R')} $1 $2`)
    })
}

const replaceMicroNotationFormation = () => {
    // We also need to replace the micro notation in Formation Detail table
    // for cases like "Wave of four (NR, WL)." Unfortunately there's no CSS
    // selector for this task.

    const formationDetailKeyCell = Array.from(document.querySelectorAll('td'))
        .find(cell => cell.textContent.includes('FormationDetail'))

    if (!formationDetailKeyCell) return

    const formationDetailValCell = formationDetailKeyCell.nextElementSibling
    formationTextNodes = getDescendentTextNodes(formationDetailValCell)
    formationTextNodes.forEach(node => {
        node.textContent = node.textContent
            .replace(/M([LR0-9][RL]?)/g, `${TERMS.get('MICRO_L')}$1`)
            .replace(/W([LR0-9][RL]?)/g, `${TERMS.get('MICRO_R')}$1`)
    })

}


const replaceAll = () => {
    replaceRoles()
    replaceChains()
    replaceShoulderRounds()
    replaceMicroNotationChoreo()
    replaceMicroNotationFormation()
}

// Save the original HTML so we can undo this later
let phrasesTableHTML = document.getElementById('phrases').innerHTML
let formationValueCellHTML = Array.from(document.querySelectorAll('td'))
    .find(cell => cell.textContent.includes('FormationDetail'))

replaceAll()