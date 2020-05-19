'use strict'

const hlp = require('../../lib/helpers.js')

const should = require('chai').should()

describe('argFail', () => {
    it('should throw error when nothing is passed in', () => {
        hlp.argFail.should.Throw(Error, "Internal error: Say what you expect to check as a string. Not undefined with type `undefined`.")
    })
    it('should throw error when object is passed as `expect`', () => {
        (()=> {
            hlp.argFail(new Object())
        }).should.Throw(Error, "Internal error: Say what you expect to check as a string. Not [object Object] with type `object`.")
    })
    it('should throw error when non-string is passed in array as `expect`', () => {
        (()=> {
            hlp.argFail(['string', 1])
        }).should.Throw(Error, "Internal error: Say what you expect to check as a string. Not 1 with type `number`.")
    })
    it('should throw error when non-valid type as `expect`', () => {
        (()=> {
            hlp.argFail(['string', 'not-valid'])
        }).should.Throw(Error, "Internal error: `not-valid` is not a valid type to check for. Please use only `string` or `number` or `array` or `object` or `function` or `boolean` or `null` or `undefined`.")
    })
    it('should return message when expect differs from got', () => {
        hlp.argFail('string', {}, 'name', 'note').should.equal('Invalid Argument name: Expect type `string` but got `object`. Note: note.')
    })
    it('should return false when matches', () => {
        hlp.argFail('array', [], 'name', null).should.be.false
    })
    it('should return false when matching null', () => {
        hlp.argFail('null', null).should.be.false
    })
    it('should return message with multiple expecteds, if differ from got', () => {
        hlp.argFail(['string', 'array'], {}, null, 'note').should.equal('Invalid Argument: Expect type `string` or `array` but got `object`. Note: note.')
    })
})

describe('applyOpts', () => {
    it('should apply props name in array', () => {
        let obj = {}
        hlp.applyOpts(obj, { foo: 'bar', hoo: 'rah'}, ['foo'])
        obj.should.have.property('foo')
        obj.should.not.have.property('hoo')
    })
})

describe('optionsBC', () => {
    it('should throw error when the old and new property names are the same.', () => {
        (()=> {
            hlp.optionsBC({}, {old: 'same-name', new: 'same-name'})
        }).should.Throw(Error, `Internal error: The old and new properties are both named \`same-name\`. Spelling mistake?`)
    })
    it('should transfer old prop to new prop.', () => {
        let payload = {oldName: 'value'}
        hlp.optionsBC(payload, { old: 'oldName', new: 'newName' })
        payload.should.have.deep.equal({ oldName: 'value', newName: 'value' })
    })
})
