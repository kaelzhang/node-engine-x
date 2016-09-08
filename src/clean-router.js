'use strict'

const make_array = require('make-array')

module.exports = (route, strict) => {
  const {
    rewrite,
    root: root = [],
    proxy_pass,
  } = route

  if (rewrite) {
    if (typeof rewrite === 'function') {
      rewrite = {
        replace: rewrite,

        // `last` default to true
        last: true
      }
    }

    const {
      replace,
      last = true
    } = rewrite

    if (typeof replace !== 'function') {
      throw new TypeError(`invalid rewrite directive.`)
    }

    return {
      rewrite: {
        replace,
        last
      }
    }
  }

  if (root) {
    return {
      root: make_array(root),
      proxy_pass
    }
  }

  if (proxy_pass) {
    return {
      proxy_pass
    }
  }

  if (strict) {
    throw new TypeError(`invalid route: ${JSON.stringify(route)}`)
  }
}
