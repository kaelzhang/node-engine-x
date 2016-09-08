'use strict'

const make_array = require('make-array')

module.exports = (route, strict) => {
  const {
    rewrite,
    root: root = [],
    proxy_pass,
  } = route

  if (rewrite) {
    const {
      replace,
      last = true
    } = typeof rewrite === 'function'
      ? {
          replace: rewrite,

          // `last` default to true
          last: true
        }
      : rewrite

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
