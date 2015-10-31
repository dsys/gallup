<img src="https://github.com/pavlovml/gallup/blob/master/resources/logo.png" alt="gallup" width="303" />

[![TravisCI shield](https://img.shields.io/travis/pavlovml/gallup.svg)](https://travis-ci.org/pavlovml/gallup) [![npm shield](https://img.shields.io/npm/v/gallup.svg)](https://www.npmjs.com/package/gallup) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)

Poll any resource using ES6 Promises and streams.

## Installation

    $ npm install gallup --save

## Usage

```javascript
import Gallup from 'gallup'

// You construct a poller by providing a poll callback as the first argument
// and an optional options object as the second. The poll function may return a
// normal value or an ES6 Promise to be evaluated.

var poller = new Gallup(() => {
    return Promise.resolve({ stub: 'data' })
}, 5000) // poll every 5 seconds (default: 1 second)

// Pollers are stopped by default. Starting them begins polling immediately.
poller.start()

// Pollers are instances of EventEmitter. When promises resolve, their values
// are emitted via 'data' events. Errors are emitted via 'error' events. If the
// previous poll is taking a long time to resolve, another poll will not be
// initiated until the previous one completes.

poller.on('data', data => {
  console.log(data)
})

poller.on('error', err => {
  console.error(err)
})

// You can also stop and restart polling.
poller.stop()
poller.start()
```

## Development

Gallup uses [JavaScript Standard Style](https://github.com/feross/standard), [Babel](https://babeljs.io/) for ES6+ support, and [Jest](http://facebook.github.io/jest/) for testing.

    $ git clone git@github.com:pavlovml/gallup.git
    $ npm test

To run the tests on file changes:

    $ npm test -- --watch

## License

[BSD 3-Clause](https://github.com/pavlovml/gallup/blob/master/LICENSE)
