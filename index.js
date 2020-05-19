/*!
 * Express Route-Magic v1.0.3
 * (c) 2020 Calvin Tan
 * Released under the MIT License.
 */
'use strict'

// modules
const fs = require('fs')
const path = require('path')
const hlp = require('./lib/helpers.js')

// defaults
const Magic = {
    _moduleName: 'express-routemagic',
    _routesFolder: 'routes',
    _allowSameName: false,
    _debug: console.log,
    _logMapping: false
}

// properties that require getters and setters
Object.defineProperties(Magic, {

    invokerPath: {
        get() {
            return this._invokerPath
        },
        set(val) {
            let fail = hlp.argFail('string', val, 'invokerPath', 'The path of where you invoked magic must be a valid `string` and passed in as 2nd argument. Typically it is `__dirname`.')
            if (fail) throw new Error(fail)
            this._invokerPath = val
        }
    },

    routesFolder: {
        get() {
            return this._routesFolder
        },
        set(val) {
            let fail = hlp.argFail('string', val, 'routesFolder', 'This value defaults to \'routes\'. If you change your folder structure to follow you won\'t need this option.')
            if (fail) throw new Error(fail)
            if (val[val.length - 1] === '/') val = val.substring(0, val.length - 1)
            this._routesFolder = val
        }
    },

    ignoreSuffix: {
        get() {
            return this._ignoreSuffix
        },
        set(val) {
            let fail = hlp.argFail(['string', 'array'], val, 'ignoreSuffix')
            if (fail) throw new Error(fail)
            this._ignoreSuffix = Array.isArray(val) ? val : [val]
        }
    },

    allowSameName: {
        get() {
            return this._allowSameName
        },
        set(val) {
            let fail = hlp.argFail('boolean', val, 'allowSameName')
            if (fail) throw new Error(fail)
            this._allowSameName = val
        }
    },

    logMapping: {
        get() {
            return this._logMapping
        },
        set(val) {
            let fail = hlp.argFail('boolean', val, 'logMapping')
            if (fail) throw new Error(fail)
            this._logMapping = val
        }
    },

    debug: {
        get() {
            return this._debug
        },
        set(val) {
            let fail = hlp.argFail('function', val, 'debug')
            if (fail) throw new Error(fail)
            this._debug = val
        }
    }
})

// methods
Magic.use = function(app, invokerPath, options) {
    if (!app) throw new Error('Invalid argument: Express `app` instance must be passed in as 1st argument.')
    this.app = app

    if(!invokerPath) throw new Error('Invalid argument: You must provided the path where you invoked magic as a `string` as 2nd argument. Typically it is `__dirname`.')
    this.invokerPath = invokerPath

    if (typeof options === 'string') this.routesFolder = options

    if (typeof options === 'object') {
        // may need debugging module downstream, so assign first.
        if (options.debug) this.debug = options.debug

        /* All BCs */

        // BC >= 0.0.1, since 0.2.0
        hlp.optionsBC(options, {
            old: 'routeFolder',
            new: 'routesFolder'
        })

        // BC >= 0.0.1, since 0.2.0
        hlp.optionsBC(options, {
            old: 'printRoutes',
            new: 'logMapping'
        })

        hlp.applyOpts(this, options, [
            'routesFolder',
            'ignoreSuffix',
            'allowSameName',
            'debug',
            'logMapping'
        ])
    }
    this.scan(this.absolutePathToRoutesFolder())
}

Magic.scan = function(directory) {
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

Magic.push = function(array, payload, isDirectory) {
    if (!this.toIgnore(payload, isDirectory)) array.push(payload)
}

Magic.toIgnore = function(payload, isDirectory) {
    if (!isDirectory) payload = payload.replace('.js', '')
    let toIgnore = false
    if (this.ignoreSuffix) {
        this.ignoreSuffix.forEach(suffix => {
            if (payload.indexOf(suffix) !== -1 && payload.indexOf(suffix) === payload.length - suffix.length) {
                toIgnore = true
                return null
            }
        })
    }
    return toIgnore
}

Magic.checkConflict = function(files, folders, directory) {
    if (this.allowSameName) return false
    files.forEach(file => {
        if (folders.indexOf(file.replace('.js', '')) !== -1) throw new Error(`Folder and file with conflict name: \`${file.replace('.js', '')}\` in directory: \`${directory}\`.`)
    })
}

Magic.require = function(dir, files) {
    let apiDirectory = this.apiDirectory(dir)
    files.forEach(file => {
        let apiPath = this.apiPath(file, apiDirectory)
        this.app.use(apiPath, require(this.absolutePathFile(dir, file)))
        if (this.logMapping) this.debug(apiPath + ' => .' + this.pathRelativeToInvoker(dir, file))
    })
}

Magic.apiDirectory = function(dir) {
    let apiDir = path.relative(this.absolutePathToRoutesFolder(), dir)
    return (apiDir.length === 0) ? '/' : '/' + apiDir
}
Magic.apiPath = function(file, apiDir) {
    return (file === 'index.js') ? apiDir : path.join(apiDir, file.replace('.js', ''))
}
Magic.absolutePathToRoutesFolder = function() {
    return path.join(this.invokerPath, this.routesFolder)
}
Magic.absolutePathFile = function(dir, file) {
    return path.join(dir, file)
}
Magic.pathRelativeToInvoker = function (dir, file) {
    return path.join(path.relative(this.invokerPath, dir), file)
}

module.exports = Object.create(Magic)
