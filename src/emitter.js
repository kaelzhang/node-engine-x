'use strict'

const { EventEmitter } = require('events')

module.exports = class Emitter extends EventEmitter {
  constructor () {
    super()

    this._emitted = {}
  }

  emitOnce (type, ...args) {
    if (type in this._emitted) {
      return
    }
    this._emitted[type] = true

    setImmediate(() => {
      this.emit(type, ...args)
    })
  }
}
