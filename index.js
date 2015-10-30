import EventEmitter from 'events'

function quantizedPoller (poll, interval, dataFn, errorFn) {
  let available = true
  function inner () {
    if (available) {
      available = false
      poll().then(data => {
        dataFn(data)
        available = true
      }, err => {
        errorFn(err)
        available = true
      })
    }
  }

  inner()
  let timeout = setInterval(inner, interval)
  return () => clearTimeout(timeout)
}

function delayedPoller (poll, interval, dataFn, errorFn) {
  function inner () {
    poll().then(data => {
      dataFn(data)
      timeout = inner()
    }, err => {
      errorFn(err)
      timeout = inner()
    })
  }

  let timeout = inner()
  return () => clearTimeout(timeout)
}

export default class Gallup extends EventEmitter {
  constructor (fn, {
    start = false,
    interval = 1000,
    quantized = true
  }) {
    this.interval = interval
    this.quantized = quantized

    this.poll = () => {
      try {
        const result = pollFn()
        return typeof result === 'object' && 'then' in result
          ? result
          : Promise.resolve(result)
      } catch (ex) {
        return Promise.reject(ex)
      }
    }

    if (start)
      this.startPolling()
  }

  emitData (data) {
    this.emit('data', data)
  }

  emitError (err) {
    this.emit('error', err)
  }

  startPolling () {
    if (this.poller == null) {
      const newPoller = this.quantized ? quantizedPoller : delayedPoller
      this.poller = newPoller(::this.poll, this.interval,
                              ::this.emitData, ::this.emitError)
    }
  }

  stopPolling () {
    if (this.poller != null) {
      this.poller()
      this.poller = null
    }
  }
}
