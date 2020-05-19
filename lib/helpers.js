'use strict'
const util = require('util')

// localised helpers
function argFail(expect, got, name, note) {
    if (!Array.isArray(expect)) expect = [expect]
    got = _type(got)
    if (_found(got)) return false
    return _msg()

    function _found(got) {
        let found = expect.find(el => _vet(el) === got)
        return typeof found !== 'undefined'
    }

    function _msg() {
        let msg = 'Invalid Argument'
        msg += name ? ' ' + name : ''
        msg += `: Expect type ${_list(expect)} but got \`${got}\`.`
        msg += note ? ` Note: ${note}.` : ''
        return msg
    }

    function _vet(el) {
        const valid = [
            'string',
            'number',
            'array',
            'object',
            'function',
            'boolean',
            'null',
            'undefined'
            // no support for symbol. should we care?
        ]
        if (typeof el !== 'string') throw new Error(`Internal error: Say what you expect to check as a string. Not ${el} with type \`${typeof el}\`.`)
        if (valid.indexOf(el) === -1) throw new Error(`Internal error: \`${el}\` is not a valid type to check for. Please use only ${_list(valid)}.`)
        return el
    }

    function _list(array) {
        return array.map(el => {
            return `\`${el}\``
        }).join(' or ')
    }

    // get rid of all the problems typeof [] is `object`.
    function _type(got) {
        if (typeof got !== 'object') return typeof got
        if (Array.isArray(got)) return 'array'
        if (got === null) return 'null'
        return 'object'
    }
}
exports.argFail = argFail

function applyOpts(obj, opts, props) {
    props.forEach(prop => {
        if (opts[prop] !== undefined) obj[prop] = opts[prop]
    })
}
exports.applyOpts = applyOpts

function optionsBC(payload, obj) {
    if (typeof payload !== 'object') throw new Error(`Internal error: optionsBC expects an \`object\`.`)
    if (obj.old === obj.new) throw new Error(`Internal error: The old and new properties are both named \`${obj.old}\`. Spelling mistake?`)
    if (typeof payload[obj.old] !== 'undefined') {
        util.deprecate(() => {
            payload[obj.new] = payload[obj.old]
        }, `\`${obj.old}\` is deprecated. Please use \`${obj.new}\` instead.`)()
    }
}
exports.optionsBC = optionsBC
