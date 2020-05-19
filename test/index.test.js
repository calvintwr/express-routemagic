'use strict'

const magic = require('../index.js')

const should = require('chai').should()
const path = require('path')

describe('routesFolder', () => {
    let magic_routesFolder = Object.create(magic)
    it('should remove trailing slash', () => {
        magic_routesFolder.routesFolder = './my/routes/folder/'
        magic_routesFolder.routesFolder.should.equal('./my/routes/folder')
    })
})

describe('ignoreSuffix', () => {
    let magic_ignoreSuffix = Object.create(magic)
    it('should make string become array', () => {
        magic_ignoreSuffix.ignoreSuffix = 'test'
        magic_ignoreSuffix.ignoreSuffix.should.be.an('array').have.lengthOf(1).have.members(['test'])
    })
})

describe('use', () => {
    it('should throw error if no app (1st argument) is passed in', () => {
        (()=> {
            magic.use()
        }).should.Throw(Error, 'Invalid argument: Express `app` instance must be passed in as 1st argument.')
    })
    it('should throw error if no invokerPath (2nd argument) is passed in', () => {
        (()=> {
            magic.use(function(){})
        }).should.Throw(Error, 'Invalid argument: You must provided the path where you invoked magic as a `string` as 2nd argument. Typically it is `__dirname`.')
    })
    it('should accept 3rd argument as routesFolder if it is a `string`', () => {
        let magic_use = Object.create(magic)
        try { magic_use.use(function(){}, __dirname, 'testFolder') } catch (error) {}
        magic_use.routesFolder.should.equal('testFolder')
    })
    it('should accept 3rd argument as object', () => {
        let magic_use = Object.create(magic)
        let debug = function () {}
        let options = {
            ignoreSuffix: ['test1', 'test2'],
            allowSameName: true,
            debug,
            logMapping: true
        }
        try { magic_use.use(function(){}, __dirname, options) } catch (error) {}
        magic_use.should.deep.include({ routesFolder: 'routes' })
    })
})

describe('push', () => {
    it('should push payload into array', () => {
        let array = []
        magic.push(array, 'payload')
        array.should.have.members(['payload'])
        magic.push(array, 'payload2')
        array.should.have.members(['payload', 'payload2'])
    })
})

describe('toIgnore', () => {
    let magic_toIgnore = Object.create(magic)
    magic_toIgnore.ignoreSuffix = ['ignore', 'dev']
    it('should be false when payload matches', () => {
        magic_toIgnore.toIgnore('ignore', true).should.be.true
        magic_toIgnore.toIgnore('dev').should.be.true
        magic_toIgnore.toIgnore('dev.js').should.be.true
    })
    it('should be true when payload don\'t match', () => {
        magic_toIgnore.toIgnore('no-match').should.be.false
    })
})

describe('checkConflict', () => {
    it('should not throw error when file and folder names don\'t conflict', () => {
        function checkConflict() {
            let files = ['no-conflict.js', 'b.js']
            let folders = ['conflict', 'd']
            magic.checkConflict(files, folders, 'foo')
        }
        checkConflict.should.not.Throw(Error)
    })
    it('should throw error when file and folder names conflict', () => {
        function checkConflict() {
            let files = ['conflict.js', 'b.js']
            let folders = ['conflict', 'd']
            magic.checkConflict(files, folders, 'foo')
        }
        checkConflict.should.Throw(Error, /Folder and file with conflict name: `conflict` in directory: `foo`./)
    })
})

describe('apiDirectory', () => {
    let magic_apiDir = Object.create(magic)
    it('should out correct api directory', () => {
        magic_apiDir.invokerPath = '/with/trailing/slash/'
        magic_apiDir.routesFolder = './with/dot-slash/'
        magic_apiDir.apiDirectory('/with/trailing/slash/with/dot-slash/my-api-folder').should.equal('/my-api-folder')
    })
    it('should out correct api directory without trailling slash', () => {
        magic_apiDir.invokerPath = '/with/trailing/slash/'
        magic_apiDir.routesFolder = './with/dot-slash/'
        magic_apiDir.apiDirectory('/with/trailing/slash/with/dot-slash/my-api-folder/').should.equal('/my-api-folder')
    })
    it('should out correct api directory `/` for outermost index.js file', () => {
        magic_apiDir.invokerPath = '/with/trailing/slash/'
        magic_apiDir.routesFolder = './with/dot-slash/'
        magic_apiDir.apiDirectory('/with/trailing/slash/with/dot-slash/').should.equal('/')
    })
})

describe('apiPath', () => {
    it('should out correct apiPath', () => {
        magic.apiPath('bar.js', '/api').should.equal('/api/bar')
    })
})

describe('absolutePathToRoutesFolder', () => {
    let magic_absPath = Object.create(magic)
    it('should out correct absolute path -1', () => {
        magic_absPath.invokerPath = '/with/trailing/slash/'
        magic_absPath.routesFolder = './with/dot-slash/'
        magic_absPath.absolutePathToRoutesFolder().should.equal('/with/trailing/slash/with/dot-slash')
    })
    it('should out correct absolute path -2', () => {
        magic_absPath.invokerPath = '/without/trailing/slash'
        magic_absPath.routesFolder = '../with/dot-dot'
        magic_absPath.absolutePathToRoutesFolder().should.equal('/without/trailing/with/dot-dot')
    })
})

describe('absolutePathFile', () => {
    it('should out correct relative path', () => {
        magic.absolutePathFile('dir', 'file.js').should.equal('dir/file.js')
    })
})

describe('pathRelativeToInvoker', () => {
    let magic_pathRelative = Object.create(magic)
    it('should out correct relative path', () => {
        magic_pathRelative.invokerPath = '/app-folder/invoker/'
        magic_pathRelative.pathRelativeToInvoker('/app-folder/routes/dir', 'file.js').should.equal('../routes/dir/file.js')
    })
})
