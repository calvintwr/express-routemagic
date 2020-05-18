# Route Magic
[![npm version](https://img.shields.io/npm/v/express-routemagic.svg?style=flat-square)](https://www.npmjs.com/package/express-routemagic)
[![Build Status](https://badgen.net/travis/calvintwr/express-routemagic?style=flat-square)](https://travis-ci.com/calvintwr/express-routemagic)
[![license](https://img.shields.io/npm/l/express-routemagic.svg?style=flat-square)](https://www.npmjs.com/package/express-routemagic)
[![install size](https://badgen.net/packagephobia/install/express-routemagic?style=flat-square)](https://packagephobia.now.sh/result?p=express-routemagic)

Route Magic is a simple and fast Nodejs module, a routing "implement-and-forget" that every app using the widely popular [Expressjs framework](https://github.com/expressjs/express) should have, because **is almost always true that your routing code folder structure is your intended api URI structure, and Route Magic will invoke your routings based on your folder structure**. It keeps express clean and simple, exactly like how it should be. This module has no dependencies.

Route Magic是一个简单而又快速的Nodejs模块。它可自动化广泛使用的[Expressjs框架](https://github.com/expressjs/express）的路由图，因为**您的路由文件夹结构几乎都是您想要的API URI结构。Route Magic将根据您的文件夹结构自动调用路由。** 它保持 Express 简洁几明了的结构。该模块不依赖其它模块。

## Installation

```
npm install express-routemagic
```
For example, go [here](https://github.com/calvintwr/express-routemagic-eg).

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
magic.use(app, __dirname) // this assumes that your routing files are in `routes`, relative to where you invoke this.
```

If your files are not in a default `routes` folder, then do this:
```js
const magic = require('express-routemagic')
magic.use(app, __dirname, '[your route directory]') // 'folder' is same as './folder'
```

## How Does It Map The Routings?

See an example app [here](https://github.com/calvintwr/express-routemagic-eg).

### Explanation

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
Route Magic is aware of your folder structure. Invoking Route Magic inside of `app.js`:

```js
magic.use(app, __dirname)
```

 is equivalent of helping you do all these below:
```js
app.use('/', require('./routes/index.js'))
app.use('/foo', require('./routes/foo.js'))
app.use('/nested-folder', require('./routes/nested-folder/index.js'))
app.use('/nested-folder/bar/bar', require('./routes/nested-folder/bar/bar.js')) // note the 2 bars here.
```

### Recommended route files syntax
Each of your route `js` files should follow the following syntax:
```js
'use strict'
const router = require('express').Router()

router.get('/', (req, res) => { res.send('You are in the root directory of this file.') })
module.exports = router
```
Note that '/' is always relative to the file structure. So if the above file is `routes/nested-folder/index.js`, the URL will be `https://domain:port/nested-folder`.

## Magic Options

```js
magic.use(app, __dirname, {
    routesFolder: './routes', // Optional
    debug: [ your own debug module ], // Optional
    logMapping: true, // Optional. This prints out all your routes. If no debug module is passed, it uses console.log by default
    allowSameName: false, // Optional. `false` by default, i.e. you should not have a `foo.js` and a folder named `foo` sitting at the same level. That's poor organisation.
    ignoreSuffix: string or array, // Optional. Allows you to skip folders or files with a suffix.
})
```
Note: It is recommended to enable `logMapping` to check your routings when you are getting started. The sequence which the routes are printed reflects sequence the routes are invoked. In general, for any given folder, it will invoke `index.js`, followed by other same-level `js` files in alphabetical order, followed by same-level folders (including its nested folders) in alphabetical order.

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

## More Option Examples

```js
const debug = require('debug')('your:namespace:magic') // some custom logging module

magic.use(app, __dirname, {
    routesFolder: './some-folder',
    debug: debug,
    logMapping: true,
    ignoreSuffix: '_bak' // Will ignore files like 'index_bak.js' or folders like 'api_v1_bak'.
})
```

You can also pass an array to `ignoreSuffix`:

```js
magic.use(app, __dirname, {
    ignoreSuffix: ['_bak', '_old', '_dev']
})
```
Try it for yourself, go [https://github.com/calvintwr/express-routemagic-eg](https://github.com/calvintwr/express-routemagic-eg).

### License

Magic is MIT licensed.
