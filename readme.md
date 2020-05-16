# Route Magic
[![npm version](https://img.shields.io/npm/v/express-routemagic.svg?style=flat-square)](https://www.npmjs.com/package/express-routemagic)
[![license](https://img.shields.io/npm/l/express-routemagic.svg?style=flat-square)](https://www.npmjs.com/package/express-routemagic)
[![install size](https://packagephobia.now.sh/badge?p=express-routemagic)](https://packagephobia.now.sh/result?p=express-routemagic)

Route Magic is a simple and fast Nodejs module to abstract away the unnecessary route invocations in the widely popular [Expressjs framework](https://github.com/expressjs/express). Route Magic will invoke your routings based on a standard folder structure. It keeps express clean and simple, exactly like how it should be. This module has no dependencies.

## Say Goodbye To This

```js
app.use('/', require('./routes/index'))
app.use('/somePath', require('./routes/somePath'))
app.use('/i/keep/repeating/myself', require('./routes/i/keep/repeating/myself'))
```

This does not make sense at all.

## Say Hello To This

This is the most basic way to use Magic:

```js
const magic = require('express-routemagic')
magic.use(app, __dirname, '[your route directory]') // 'routes' is same as './routes', or './../routes' is same as '../routes'
```

## Installation

```
npm install express-routemagic
```

## How Does It Map The Routings?

Assuming the below file structure:

```
project-folder
|--app
|--routes
|   |--nested-folder
|   |   |--bar
|   |   |   |--bar.js
|   |   |--index.js
|   |--index.js
|   |--foo.js
|--app.js
```

Invoking Route Magic inside of app.js is equivalent to the following:

```js
app.use('/', require('./routes/index.js'))
app.use('/foo', require('./routes/foo.js'))
app.use('/nested-folder', require('./routes/nested-folder/index.js'))
app.use('/nested-folder/bar/bar', require('./routes/nested-folder/bar/bar.js')) // note the 2 bars here.
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
Note: It is recommended to enable `printRoutes` to check your routings when you are getting started. The sequence which the routes are printed reflects sequence the routes are invoked. In general, for any given folder, it will invoke `index.js`, followed by other `js` in alphabetical order, followed by folders in alphabetical order.

### Routing Ordering Gotcha (a.k.a Express routing codesmells)

The order of Express middleware (routings are middlewares as well) matters. But good express routing practices will negate surprises. An example of bad express routing practices that can spring surprise on you, whether you switch to Magic, or if you later re-organise/rename your folders:

```js
router.get('/:param', (req, res) => {
    // this should be avoided because this can block all routes invoked below it if it's invoked before them.
})

// these will never get called
router.get('/foo', (req, res) => { ... })
router.get('/bar', (req, res) => { ... })
```

Instead, stick to the below and you will be fine:

```js
router.get('/unique-name/:param', (req, res) => {
    // `unique-name` should be a terminal route, meaning it will not have any subpath under it.

    // it should also not share any name with other folders names that sits on the same level with its containing file.
    // i.e., any other folders that sits on the same level as the file that contains this `unique-name` route, should not have the name `unique-name`.

    // |-- i-dont-have-the-same-unique-name
    // |    |-- index.js
    // |
    // |-- the-file-that-contains-the-route-with-unique-name.js

})

// these will get called
router.get('/foo', (req, res) => { ... })
router.get('/bar', (req, res) => { ... })
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
