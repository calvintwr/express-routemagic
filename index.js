/*!
 * Express Route-Magic v2.0.2
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
    _logMapping: false,
    _invokerPath: path.join(__dirname, './../../')
}

// properties that require getters and setters
Object.defineProperties(Magic, {

    invokerPath: {
        get() {
            return this._invokerPath
        },
        set(val) {
            let fail = hlp.argFail('string', val, 'invokerPath', 'The path of where you invoked magic must be a valid `string`. Typically it is `__dirname`.')
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
Magic.use = function(app, relativeRoutesFolderOrOptions) {
    if (!app) throw new Error('Invalid argument: Express `app` instance must be passed in as 1st argument.')
    this.app = app

    if (!hlp.argFail('string', relativeRoutesFolderOrOptions)) {

        this.routesFolder = relativeRoutesFolderOrOptions

    } else if (!hlp.argFail('object', relativeRoutesFolderOrOptions)) {

        let options = relativeRoutesFolderOrOptions

        // may need debugging module downstream, so assign first.
        if (options.debug) this.debug = options.debug

        hlp.applyOpts(this, options, [
            'routesFolder',
            'ignoreSuffix',
            'allowSameName',
            'debug',
            'logMapping',
            'invokerPath'
        ])
    }

    this.scan(this.absolutePathToRoutesFolder())
}

Magic.scan = function(directory) {
    let _folders = []
    let _files = []

    if (!fs.existsSync(directory)) throw new Error(`Routes folder not found in: ${directory}`)

    fs.readdirSync(directory).filter(file => {

        // ignore hidden file
        if (file.indexOf('.') === 0) return false

        // directory
        if (fs.lstatSync(directory + '/' + file).isDirectory()) {
            this.push(_folders, file, true)
            return false
        }

        // js files
        return (
            (file.indexOf('.js') === file.length - '.js'.length) ||
            (file.indexOf('.ts') === file.length - '.ts'.length)
        )

    }).forEach(file => {
        if (['index.js', 'index.ts'].indexOf(file) > -1) {
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
    if (!isDirectory) payload = payload.substring(0, payload.length - 3) // remove the extension
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
        if (folders.indexOf(file.substring(0, file.length - 3)) !== -1) throw new Error(`Folder and file with conflict name: \`${file.substring(0, file.length - 3)}\` in directory: \`${directory}\`.`)
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
    // TODO: To support passing array to
    // have to check whether the apiDir have any commas. if yes can indicate a ['/route1', '/route2'] kind.
    // also need to check if file have any commans. if yes can indicate a ['/route1/filename1', '/route2/filename1', '/route1/filename2', '/route2/filename2'] kind of situation.
    return (['index.js', 'index.ts'].indexOf(file) > -1) ? apiDir : path.join(apiDir, file.substring(0, file.length - 3))
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
