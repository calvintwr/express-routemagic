# Route Magic

Route Magic is a simple and fast Nodejs module to abstract away the unnessary route invocations in the widely popular [Expressjs framework] (https://github.com/expressjs/express). This module has no dependencies.

## Say Goodbye To This

```js
app.use('/', require('./routes/index'))
app.use('/somePath', require('./routes/somePath))
app.use('/i/keep/repeating/myself', require('./routes/i/keep/repeating/myself))
```

This does not make sense at all.

## Say Hello To This

This is the most basic way to use Magic:

```js
const magic = require('express-routemagic')
magic.use(app, __dirname, '[your route directory]')
```

## Installation

```
npm install express-routemagic
```

## Options

```js
magic.use(app, __dirname, {
    routeFolder: './routes', // Mandatory
    debug: [ your own debug module ], // Optional
    printRoutes: true, // Optional. This prints out all your routes. If no debug module is passed, it uses console.log by default
    allowSameName: false, // Optional. `false` by default, i.e. you should not have a `foo.js` and a folder named `foo` sitting at the same level. That's poor organisation.
    ignoreSuffix: string or array, // Optional. Allows you to skip folders or files with a suffix.
})
```

## More Examples

```js
const debug = require('debug')('your:namespace:magic')

magic.use(app, __dirname, {
    routeFolder: './routes', 
    debug: debug,
    printRoutes: true, 
    ignoreSuffix: '_bak' // Will ignore files like 'index_bak.js' or folders like 'api_v1_bak'.
})
```

You can also pass an array to `ignoreSuffix`:

```js
magic.use(app, __dirname, {
    ignoreSuffix: ['_bak', '_old', '_dev']
})
```

### License

Magic is MIT licensed.
