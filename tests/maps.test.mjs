import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
	HALF_GYP_TERMS,
	ROLE_TERMS_BIRDS,
	ROLE_TERMS_LF,
} from '../extension/maps.js'

describe('maps.js exports', () => {
	it('exports HALF_GYP_TERMS as a Map', () => {
		assert.ok(HALF_GYP_TERMS instanceof Map)
	})

	it('exports ROLE_TERMS_BIRDS as a Map', () => {
		assert.ok(ROLE_TERMS_BIRDS instanceof Map)
	})

	it('exports ROLE_TERMS_LF as a Map', () => {
		assert.ok(ROLE_TERMS_LF instanceof Map)
	})
})

describe('HALF_GYP_TERMS', () => {
	it('has double trade replacement', () => {
		assert.equal(HALF_GYP_TERMS.get('DOUBLE_TRADE'), 'quick trades')
	})
})

describe('ROLE_TERMS_BIRDS', () => {
	it('replaces gendered role terms with Larks/Robins', () => {
		assert.equal(ROLE_TERMS_BIRDS.get('ROLE_R'), 'Robins')
		assert.equal(ROLE_TERMS_BIRDS.get('ROLE_L'), 'Larks')
	})

	it('has all chain variants', () => {
		assert.equal(ROLE_TERMS_BIRDS.get('CHAIN_R'), 'Robins chain')
		assert.equal(ROLE_TERMS_BIRDS.get('CHAIN_L'), 'Larks chain')
		assert.equal(ROLE_TERMS_BIRDS.get('CHAIN_R_BY_L'), 'right-hand chain')
		assert.equal(ROLE_TERMS_BIRDS.get('GRAND_CHAIN_R'), 'Robins grand chain')
		assert.equal(ROLE_TERMS_BIRDS.get('GRAND_CHAIN_L'), 'Larks grand chain')
		assert.equal(ROLE_TERMS_BIRDS.get('OPEN_CHAIN_R'), 'Robins open chain')
		assert.equal(ROLE_TERMS_BIRDS.get('OPEN_CHAIN_L'), 'Larks open chain')
		assert.equal(ROLE_TERMS_BIRDS.get('THREE_CHAIN_R'), 'Three Robins chain')
	})

	it('has micro-notation initials', () => {
		assert.equal(ROLE_TERMS_BIRDS.get('MICRO_R'), 'R')
		assert.equal(ROLE_TERMS_BIRDS.get('MICRO_L'), 'L')
	})
})

describe('ROLE_TERMS_LF', () => {
	it('replaces gendered role terms with Leads/Follows', () => {
		assert.equal(ROLE_TERMS_LF.get('ROLE_R'), 'Follows')
		assert.equal(ROLE_TERMS_LF.get('ROLE_L'), 'Leads')
	})

	it('has the same keys as ROLE_TERMS_BIRDS', () => {
		const birdsKeys = [...ROLE_TERMS_BIRDS.keys()].sort()
		const lfKeys = [...ROLE_TERMS_LF.keys()].sort()
		assert.deepEqual(birdsKeys, lfKeys)
	})

	it('has micro-notation initials', () => {
		assert.equal(ROLE_TERMS_LF.get('MICRO_R'), 'F')
		assert.equal(ROLE_TERMS_LF.get('MICRO_L'), 'L')
	})
})
