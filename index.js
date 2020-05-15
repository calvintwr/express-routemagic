/*!
 * Express Route-Magic v0.0.1
 * (c) 2020 Calvin Tan
 * Released under the MIT License.
 */
'use strict'

// modules
const fs = require('fs')
const path = require('path')

const Magic = {}

Magic.ignoreSuffix = []
Magic.routeFolder = ''
Magic.allowSameName = false
Magic.debug = console.log
Magic.printRoutes = false

Magic.use = function (app, options) {

    if (!app) throw new Error('Invalid argument: Express `app` instance must be passed in as first argument.')

    Magic.app = app

    if (typeof options === 'string') this.routeFolder = options

    if (typeof options === 'object') {

        if (!options.routeFolder || typeof options.routeFolder !== 'string') {
            throw new Error('Invalid argument: `options.routeFolder` must be a valid `string`.')
        }
        this.routeFolder = options.routeFolder

        if (options.ignoreSuffix) {
            if (typeof options.ignoreSuffix === 'string') {
                this.ignoreSuffix = [options.ignoreSuffix]
            } else if (Array.isArray(options.ignoreSuffix)) {
                this.ignoreSuffix = options.ignoreSuffix
            } else {
                throw new Error('`Invalid argument`: `options.ignoreSuffix` must either be `string` or `array`.')
            }

        }

        if (options.allowSameName) {
            if (typeof options.allowSameName !== 'boolean') throw new Error('Invalid argument: `options.allowSameName` must be a valid `boolean`.')
            this.allowSameName = true
        }

        if (options.debug) this.debug = options.debug

        if (options.printRoutes) {
            if (typeof options.printRoutes !== 'boolean') throw new Error('Invalid argument: `options.printRoutes` must be a valid `boolean`.')
            this.printRoutes = true
        }
    }
    this.scan(path.join(__dirname, this.routeFolder))
}

Magic.scan = function (directory) {

    let _folders = []
    let _files = []

    fs.readdirSync(directory).filter(file => {

        // ignore hidden file
        if (file.indexOf('.') === 0) return false

        // directory
        if (fs.lstatSync(directory + '/' + file).isDirectory()) {
            this.push(_folders, file, true)
            return false
        }

        // js files
        return (file.indexOf('.js') === file.length - '.js'.length)

    }).forEach(file => {

        if (file === 'index.js') {
            _files.unshift(file)
        } else {
            this.push(_files, file)
        }

    })

    this.checkConflict(_files, _folders, directory)

    // require
    this.require(directory, _files)

    // scan folders
    _folders.forEach(folder => {
        this.scan(directory + '/' + folder)
    })
}

Magic.push = function (array, payload, isDirectory) {
    if (!this.toIgnore(payload, isDirectory)) array.push(payload)
}

Magic.toIgnore = function (payload, isDirectory) {

    if (!isDirectory) payload = payload.replace('.js', '')

    let toIgnore = false
    this.ignoreSuffix.forEach(suffix => {
        if (payload.indexOf(suffix) !== -1 && payload.indexOf(suffix) !== payload.length - suffix.length) {
            toIgnore = true
            return null
        }
    })
    return toIgnore
}

Magic.checkConflict = function (files, folders, directory) {
    if (this.allowSameName) return false
    files.forEach(file => {
        if (folders.indexOf(file.replace('.js', '')) !== -1) throw new Error('Folder and file with conflict name: `' + file.replace('.js', '') + '` in directory: `' + directory + '`.')
    })
}

Magic.require = function (directory, files) {

    let apiPath = directory.replace(path.join(__dirname, this.routeFolder), '') + '/'

    files.forEach(file => {
        if (file === 'index.js') {
            this.app.use(apiPath, require(path.join(directory, file).replace(__dirname, '.')))
            if (this.printRoutes) this.debug(apiPath + ' => ' + path.join(directory, file).replace(__dirname, '.'))
        } else {
            let subPath = apiPath + file.replace('.js', '')
            this.app.use(subPath, require(path.join(directory, file).replace(__dirname, '.')))
            if (this.printRoutes) this.debug(subPath + ' => ' + path.join(directory, file).replace(__dirname, '.'))
        }
    })
}

module.exports = Object.create(Magic)