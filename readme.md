# Route Magic
[![npm version](https://img.shields.io/npm/v/express-routemagic.svg?style=flat-square)](https://www.npmjs.com/package/express-routemagic)
[![Build Status](https://badgen.net/travis/calvintwr/express-routemagic?style=flat-square)](https://travis-ci.com/calvintwr/express-routemagic)
[![Coverage Status](https://badgen.net/coveralls/c/github/calvintwr/express-routemagic?style=flat-square)](https://coveralls.io/r/calvintwr/express-routemagic)
[![license](https://img.shields.io/npm/l/express-routemagic.svg?style=flat-square)](https://www.npmjs.com/package/express-routemagic)
[![install size](https://badgen.net/packagephobia/install/express-routemagic?style=flat-square)](https://packagephobia.now.sh/result?p=express-routemagic)

>Route Magic is a simple and fast "implement-and-forget" routing module all Nodejs+Expressjs set ups should have.

**Why? Because your routes folder structure is almost always your intended api URI structure; it ought to be automated, but it hasn't been. So Route Magic will do just that to invoke your routings based on file structure**. Drastically reduce unnecessary code -- keep your express app clean and simple, exactly like how it should be. This module has no dependencies.

Route Magic是一个简单而又快速的Nodejs模块。它可自动化广泛使用的[Expressjs框架](https://github.com/expressjs/express)的路由图，因为**您的路由文件夹结构几乎都是您想要的API URI结构。Route Magic将根据您的文件夹结构自动调用路由。** 它保持 Express 简洁几明了的结构。该模块不依赖其它模块。

## Installation

```
npm i express-routemagic --save
```
For example, go [here](https://github.com/calvintwr/express-routemagic-eg).

## Usage

```js
// this file is app.js
const magic = require('express-routemagic')
magic.use(app)
// Note: this assumes your routing files to be in `./routes` relative to the ROOT of your nodejs app.
```
That's it! Continue to code everything else and let Magic take care of requiring your routes.
(Note: Scroll to bottom for much more options.)

## Prologue
The author's express app was simple at first. Right out of the box, everything seemed complete, nothing more was desired. But very quickly, it grew, and something felt amiss: the oddly familiar muscle reflex in performing ctrl c and p...

```js
app.use('/', require('./routes/index'))
app.use('/somePath', require('./routes/somePath'))
app.use('/i/keep/repeating/myself', require('./routes/i/keep/repeating/myself'))
//... and many more lines of repetitive code...
```
With every line, came the thought: “It's just one more”. But that didn't end; only to inevitably converge the dissonances into a crescendo:

>This doesn't make sense anymore.

**_This was how Magic was born._**

## Say Hello to This

You have already organised your files. So make that work for you:

```js
// This shows all of magic's options
magic.use(app, {
    routesFolder: './routes', // Optional. If `invokerPath` is not defined, this is relative to your nodejs ROOT.
    invokerPath: __dirname, // Optional. If this is defined, `routesFolder` will be relative to this path instead of your nodejs ROOT.
    debug: [ your own debug module ], // Optional
    logMapping: true, // Optional. This prints out all your routes. If no debug module is passed, it uses console.log by default
    allowSameName: false, // Optional. `false` by default, i.e. you should not have a `foo.js` and a folder named `foo` sitting at the same level. That's poor organisation.
    ignoreSuffix: string or array // Optional. Allows you to skip folders or files with a suffix.
})
```
Note: When getting started, enable `logMapping` to check your routings. The sequence which the routes are printed reflects the sequence the routes are invoked. **(Note:In general, for any given folder, it will invoke `index.js`, followed by other same-level `js` files in alphabetical order, followed by same-level folders (including its nested folders) in alphabetical order.)**

To get started, you can generate a default Express app [using the CLI shipped by Express](https://expressjs.com/en/starter/generator.html) and modify its `app.js`.

Or you can see an example [here](https://github.com/calvintwr/express-routemagic-eg).

If your files are not in a default `routes` folder, you can define it for Magic:
```js
magic.use(app, '[your routing directory relative to nodejs root]') // 'folder' is same as './folder'
```

## Further Reading - How Does it Map the Routings?

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
Route Magic is aware of your folder structure. Invoking Route Magic inside of `app.js` like this:
```js
magic.use(app)
```
Is equivalent of doing all these automatically:
```js
app.use('/', require('./routes/index.js'))
app.use('/foo', require('./routes/foo.js'))
app.use('/nested-folder', require('./routes/nested-folder/index.js'))
app.use('/nested-folder/bar/bar', require('./routes/nested-folder/bar/bar.js')) // note the 2 bars here.
```
### Recommended route files syntax
You can either follow the syntax per generated by [express-generator](https://expressjs.com/en/starter/generator.html), or follow a slightly more updated syntax below in each of your routing `js` files:
**ES6 syntax**
```js
'use strict'
const router = require('express').Router() // still retained #require instead of #import due practicable compatibility.

router.get('/', (req, res) => { res.send('You are in the root directory of this file.') })
module.exports = router
```
**ES5 syntax**
```js
'use strict'
var router = require('express').Router()

router.get('/', function(req, res) { res.send('You are in the root directory of this file.') })
module.exports = router
```

Note that '/' is always relative to the file structure. So if the above file is `routes/nested-folder/index.js`, the URL will be `https://domain:port/nested-folder`. This is the default Express behaviour and also automatically done for you by Magic.

### Routing Ordering Gotcha (a.k.a Express routing codesmells)
The order of Express middleware (routings are middlewares as well) matters. Good express routing practices will negate surprises, whether you switch to Magic, or if you later re-organise/rename your folders. An example of bad express routing practice:

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

    // this file should also not share the same name with any other folders that sits on the same level with it.
    // |-- i-dont-have-the-same-unique-name
    // |    |-- index.js
    // |
    // |-- the-file-that-contains-the-route-with-unique-name.js
})

// these will get called
router.get('/foo', (req, res) => { ... })
router.get('/bar', (req, res) => { ... })
```

## More Examples - Additional Magic Options

```js
const debug = require('debug')('your:namespace:magic') // some custom logging module

magic.use(app, {
    routesFolder: './some-folder',
    debug: debug,
    logMapping: true,
    ignoreSuffix: '_bak' // Will ignore files like 'index_bak.js' or folders like 'api_v1_bak'.
})
```
You can also pass an array to `ignoreSuffix`:

```js
magic.use(app, {
    ignoreSuffix: ['_bak', '_old', '_dev']
})
```
Try it for yourself, go to [https://github.com/calvintwr/express-routemagic-eg](https://github.com/calvintwr/express-routemagic-eg).

### License

Magic is MIT licensed.
