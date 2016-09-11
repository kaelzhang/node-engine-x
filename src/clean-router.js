'use strict'

const make_array = require('make-array')

module.exports = (route, strict) => {
  const {
    rewrite,
    root,
    proxy_pass,
    returns
  } = route

  if (rewrite) {
    if (typeof rewrite !== 'function') {
      throw new TypeError(`invalid rewrite directive.`)
    }

    return {
      rewrite
    }
  }

  if (root || proxy_pass || returns) {
    return {
      root: make_array(root),
      proxy_pass,
      returns
    }
  }

  if (strict) {
    throw new TypeError(`invalid route: ${JSON.stringify(route)}`)
  }
}
