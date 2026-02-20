const HALF_GYP_TERMS = new Map([
	// Double gyp always seems to show up as "Corner trade 4 (quick trades)"
	// so this should be a reasonable substitution
	['DOUBLE_TRADE', 'quick trades'],
])

const ROLE_TERMS_BIRDS = new Map([
	['ROLE_R', 'Robins'],
	['ROLE_L', 'Larks'],
	['CHAIN_R', 'Robins chain'],
	['CHAIN_L', 'Larks chain'],
	['CHAIN_R_BY_L', 'right-hand chain'],
	['GRAND_CHAIN_R', 'Robins grand chain'],
	['GRAND_CHAIN_L', 'Larks grand chain'],
	['OPEN_CHAIN_R', 'Robins open chain'],
	['OPEN_CHAIN_L', 'Larks open chain'],
	['THREE_CHAIN_R', 'Three Robins chain'],
	// Single initials for micro-notation, such as in hey or waves descriptions
	['MICRO_R', 'R'],
	['MICRO_L', 'L'],
])

const ROLE_TERMS_LF = new Map([
	['ROLE_R', 'Follows'],
	['ROLE_L', 'Leads'],
	['CHAIN_R', 'Follows chain'],
	['CHAIN_L', 'Leads chain'],
	['CHAIN_R_BY_L', 'right-hand chain'],
	['GRAND_CHAIN_R', 'Follows grand chain'],
	['GRAND_CHAIN_L', 'Leads grand chain'],
	['OPEN_CHAIN_R', 'Follows open chain'],
	['OPEN_CHAIN_L', 'Leads open chain'],
	['THREE_CHAIN_R', 'Three follows chain'],
	// Single initials for micro-notation, such as in hey or waves descriptions
	['MICRO_R', 'F'],
	['MICRO_L', 'L'],
])
