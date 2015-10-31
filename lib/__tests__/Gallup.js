jest.dontMock('../Gallup')
const Gallup = require('../Gallup')

class StubPromise {
  constructor () {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }

  then (...args) {
    return this.promise.then(...args)
  }

  catch (...args) {
    return this.promise.catch(...args)
  }
}

describe('Gallup', () => {
  let poller

  afterEach(() => {
    jest.clearAllTimers()

    if (poller) {
      poller.stop()
      poller.removeAllListeners()
    }
  })

  it('is stopped by default', () => {
    poller = new Gallup(() => null)
    expect(poller.isPolling()).toBeFalsy()
  })

  it('can be started and stopped', () => {
    poller = new Gallup(() => null)
    poller.start()
    expect(poller.isPolling()).toBeTruthy()
    poller.stop()
    expect(poller.isPolling()).toBeFalsy()
  })

  pit('polls immediately when started', () => {
    poller = new Gallup(() => 'stub')
    poller.start()

    return new Promise(resolve => {
      poller.on('data', data => {
        expect(data).toBe('stub')
        resolve()
      })
    })
  })

  pit('supports polling with ES6 Promises', () => {
    poller = new Gallup(() => Promise.resolve('stub'))
    poller.start()

    return new Promise(resolve => {
      poller.on('data', data => {
        expect(data).toBe('stub')
        resolve()
      })
    })
  })

  pit('handles errors in the poll function', () => {
    const stubErr = new Error()
    poller = new Gallup(() => { throw stubErr })
    poller.start()

    return new Promise(resolve => {
      poller.on('error', err => {
        expect(err).toBe(stubErr)
        resolve()
      })
    })
  })

  pit('handles errors in ES6 Promises', () => {
    poller = new Gallup(() => Promise.reject('err'))
    poller.start()

    return new Promise((resolve, reject) => {
      poller.on('error', err => {
        expect(err).toBe('err')
        resolve()
      })
    })
  })

  pit('polls at regular intervals', () => {
    let i = 0
    let j = 0
    poller = new Gallup(() => i++)
    poller.start()

    return new Promise(resolve => {
      poller.on('data', data => {
        expect(data).toBe(j++)
        if (j === 10) {
          resolve()
        } else {
          jest.runOnlyPendingTimers()
        }
      })
    })
  })

  pit.only('does not poll if the previous poll is still executing', () => {
    const stubPromises = []
    poller = new Gallup(() => {
      const p = new StubPromise()
      stubPromises.push(p)
      return p
    })

    poller.start()
    expect(stubPromises.length).toBe(1)

    // Let some time pass...
    jest.runOnlyPendingTimers()
    jest.runOnlyPendingTimers()
    expect(stubPromises.length).toBe(1)

    stubPromises[0].resolve('foo')

    return new Promise(resolve => {
      poller.once('data', data => {
        expect(data).toBe('foo')

        // Let some more time pass...
        jest.runOnlyPendingTimers()
        jest.runOnlyPendingTimers()
        jest.runOnlyPendingTimers()
        expect(stubPromises.length).toBe(2)

        stubPromises[1].resolve('bar')

        poller.once('data', data => {
          expect(data).toBe('bar')
          resolve()
        })
      })
    })
  })
})
