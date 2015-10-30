# gallup

Poll any resource using ES6 Promises and streams.

## Installation

    $ npm install gallup --save

## Usage

```javascript
var Gallup = require('gallup')

// You construct a poller by providing a poll callback as the first argument
// and an optional options object as the second to the Gallup constructor. The
// poll function may return a normal value or an ES6 Promise to be evaluated.

var poller = new Gallup(function () {
  return Promise.resolve({ stub: 'data' })
}, {
  start: true,      // immediately start polling   (default: false)
  interval: 5000,   // poll every 5 seconds        (default: 1 second)
  quantized: false  // whether to quantize polling (default: true, see below)
})

// Pollers are instances of EventEmitter. When promises resolve, their values
// are emitted via 'data' events. Errors are emitted via 'error' events.

poller.on('data', function (data) {
  console.log('Received data: ' + data)
})

poller.on('error', function (err) {
  console.error(err)
})

// You can also manually start and stop polling.

poller.stopPolling()
poller.startPolling()
```

### Quantization

Gallup has two polling modes: **delayed** and **quantized**.

**Delayed** pollers (`opts.quantized === false`) evaluate the poll function
immediately after starting, wait for the promise to resolve or reject, idle for
the provided interval, and repeat. They're useful for when rate-limits are an
issue, guaranteeing that there is at least `opts.interval` milliseconds between
the completion and initialization of consecutive polls.

**Quantized** pollers (`opts.quantized === true`) also evaluate the poll
function immediately after starting and wait for the promise to resolve or
reject.  Where they differ from delayed pollers is when they evaluate the poll
function to poll again. Every `opts.interval` milliseconds after they are
started, quantized pollers will poll again if the previous promise has
completed. In effect, this quantizes the evaluations to the poll function to
the provided interval. This is probably what you want, and hence the default.

## License

[BSD 3-Clause](https://github.com/pavlovml/gallup/blob/master/LICENSE)
