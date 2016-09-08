'use strict'

const fs = require('fs')
const node_path = require('path')
const async = require('async')

const Location = require('./location')
const clean = require('./clean-router')

const {
  MODIFIER_CASE_INSENSATIVE,
  MODIFIER_CASE_SENSATIVE,
  MODIFIER_DEFAULT,
  MODIFIER_EQUAL,
  MODIFIER_MATCH_LONGEST
} = Location.MODIFIERS

module.exports = class Router {
  constructor ({
    rewrite,
    root,
    proxy_pass,
    routes = []
  }) {

    this._routes = []
    this._default_router = clean({
      rewrite,
      root,
      proxy_pass
    })

    routes.forEach((route) => {
      this.add(route)
    })
  }

  add (route) {
    const location = Location.from(route)
    const cleaned = clean(route, true)
    cleaned.location = location

    return this._add(cleaned)
  }

  _add (route) {
    this._routes.push(route)

    return this
  }

  // @returns {Number}
  _matched_router_index ({pathname, method}) {
    let regex_match = null
    let prefix_match = null

    const found = this._routes.findIndex(({location}, index) => {
      const {
        match,
        modifier
      } = location.match(pathname)

      if (!match) {
        return
      }

      if (modifier === MODIFIER_EQUAL) {
        return true
      }

      // RegExp
      if (
        modifier === MODIFIER_CASE_SENSATIVE
        || modifier === MODIFIER_CASE_INSENSATIVE
        || !regex_match
      ) {
        regex_match = {
          index
        }
        return
      }

      if (
        modifier === MODIFIER_PREFIX
        || modifier === MODIFIER_PREFIX_LONGEST
      ) {
        const length = location.length()

        if (
          !prefix_match
          || length > prefix_match.length
        ) {
          prefix_match = {
            index,
            length,
            modifier
          }

          return
        }
      }
    })

    // MODIFIER_EQUAL
    if (~found) {
      return found
    }

    if (!prefix_match && !regex_match) {
      return -1
    }

    if (!prefix_match) {
      return regex_match.index
    }

    if (prefix_match.modifier === MODIFIER_MATCH_LONGEST) {
      return prefix_match.index
    }

    return regex_match.index
  }

  // @returns {route}
  _matched_router (request) {
    const index = this._matched_router_index(request)
    return this._routes[index] || this._default_router
  }

  route ({
    pathname,
    method
  }, callback) {

    this._route({
      pathname,
      method
    }, callback)
  }

  _route ({
    pathname,
    method,

    // if true, then it will skip rewrite
    no_rewrite = false
  }, callback) {

    // `pathname` always starts with '/'
    pathname = pathname || '/'

    const router = this._matched_router({
      pathname,
      method
    })

    if (!router) {
      callback(null, null)
      return
    }

    const {
      rewrite
    } = router

    if (rewrite && no_rewrite) {
      callback(null, null)
      return
    }

    if (rewrite && !no_rewrite) {
      pathname = rewrite.replace(pathname)
      return this._route({
        pathname,
        method,
        no_rewrite: rewrite.last
      }, callback)
    }

    const {
      root,
      proxy_pass
    } = router

    this._try_files(pathname, root, (found) => {
      if (found) {
        return callback(found, null)
      }

      if (!proxy_pass) {
        return callback(null, null)
      }

      const url = proxy_pass + pathname
      callback(null, url)
    })
  }

  _try_files (pathname, root, callback) {
    let found = null

    async.someSeries(root, (root, done) => {
      const path = node_path.join(root, pathname)
      fs.exists(path, (exists) => {
        if (exists) {
          found = path
          return done(null, true)
        }

        done(null, false)
      })

    }, () => {
      callback(found)
    })
  }
}
