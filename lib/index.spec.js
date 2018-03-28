'use strict'

const expect = require('chai').expect
const lib = require('../')

describe('The module', () => {
    it('exposes an koa object', () => {
        expect(lib).to.have.property('koa')
    })

    it('exposes the ruleset', () => {
        expect(lib).to.have.property('rules')
    })
})