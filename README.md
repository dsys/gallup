# gallup

Poll any resource using ES6 Promises and streams.

## Installation

    $ npm install gallup --save

## Usage

```javascript
var Gallup = require('gallup')

// You construct a poller by providing a poll callback as the first argument
// and an optional options object as the second. The poll function may return a
// normal value or an ES6 Promise to be evaluated.

var poller = new Gallup(function () {
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

Gallup uses [Jest](http://facebook.github.io/jest/) for testing. There's really
not much to it:

    $ git clone git@github.com:pavlovml/gallup.git
    $ npm test

To run the tests on file changes:

    $ npm test

## License

[BSD 3-Clause](https://github.com/pavlovml/gallup/blob/master/LICENSE)
