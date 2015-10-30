import EventEmitter from 'events'

function newPoller (poll, interval, callback) {
  let timeout
  let alive = true
  let available = true
  const makeAvailable = () => { available = true }

  function inner () {
    if (available) {
      available = false
      const p = poll()
      p.then(makeAvailable, makeAvailable)
      callback(p)
    }

    if (alive)
      timeout = setTimeout(inner, interval)
  }

  inner()
  return () => {
    clearTimeout(timeout)
    alive = false
    available = false
  }
}

export default class Gallup extends EventEmitter {
  constructor (fn, interval = 1000) {
    super()
    this.interval = interval

    this.poll = () => {
      try {
        return Promise.resolve(fn())
      } catch (ex) {
        return Promise.reject(ex)
      }
    }
  }

  isPolling () {
    return this.poller != null
  }

  emitData (data) {
    this.emit('data', data)
  }

  emitError (err) {
    this.emit('error', err)
  }

  start () {
    if (this.poller == null) {
      this.poller = newPoller(::this.poll, this.interval, p => {
        p.then(::this.emitData, ::this.emitError)
      })
    }
  }

  stop () {
    if (this.poller != null) {
      this.poller()
      this.poller = null
    }
  }
}
