'use strict'

const fs = require('fs')
const node_path = require('path')

const async = require('async')

const Location = require('./location')
const clean = require('./clean-router')
const Emitter = require('./emitter')


const {
  MODIFIER_CASE_INSENSATIVE,
  MODIFIER_CASE_SENSATIVE,
  MODIFIER_PREFIX,
  MODIFIER_EQUAL,
  MODIFIER_PREFIX_LONGEST,
  MODIFIER_FUNCTION
} = Location.MODIFIERS

class Router {
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

      // > using the “=” modifier it is possible to define an exact match of URI and location.
      // > If an exact match is found, the search terminates.
      if (modifier === MODIFIER_EQUAL) {
        return true
      }


      if (modifier === MODIFIER_FUNCTION) {
        return true
      }

      // RegExp
      if (
        (
          modifier === MODIFIER_CASE_SENSATIVE
          || modifier === MODIFIER_CASE_INSENSATIVE

        // > The search of regular expressions terminates on the first match,
        // >  and the corresponding configuration is used.
        ) && !regex_match
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

    // > If the longest matching prefix location has the “^~” modifier
    // >  then regular expressions are not checked.
    if (prefix_match.modifier === MODIFIER_PREFIX_LONGEST) {
      return prefix_match.index
    }

    // > If no match with a regular expression is found
    // >  then the configuration of the prefix location
    // >  remembered earlier is used.
    if (!regex_match) {
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

    const emitter = new Emitter()

    this._route({
      pathname,
      method
    }, emitter)

    return emitter
  }

  _route ({
    pathname,
    method,
    rewrite_count = 0
  }, emitter) {

    // `pathname` always starts with '/'
    pathname = pathname || '/'

    const router = this._matched_router({
      pathname,
      method
    })

    if (!router) {
      emitter.emitOnce('not-found')
      return
    }

    const {
      rewrite
    } = router

    if (rewrite) {
      return this._rewrite({
        rewrite,
        pathname,
        method,
        rewrite_count,
        emitter
      })
    }

    const {
      root,
      proxy_pass,
      returns
    } = router

    this._try_files(pathname, root, (found) => {
      if (found) {
        emitter.emitOnce('found', found)
        return
      }

      if (proxy_pass) {
        const url = proxy_pass + pathname
        emitter.emitOnce('proxy-pass', url)
        return
      }

      if (returns) {
        emitter.emitOnce('return', returns)
        return
      }

      emitter.emitOnce('not-found')
    })
  }

  _rewrite ({
    rewrite,
    pathname,
    method,
    rewrite_count,
    emitter
  }) {

    rewrite_count ++

    if (rewrite_count > Router.REWRITE_LIMIT) {
      emitter.emitOnce('error', new Error('too many rewrites.'))
      return
    }

    let redirect_url
    let permanent = false
    let redirect_called = false

    function redirect (url, perm) {
      redirect_called = true
      redirect_url = url
      permanent = perm
    }

    const result = rewrite(pathname, redirect)

    if (redirect_called) {
      emitter.emitOnce('redirect', redirect_url, permanent)
      redirect_url = null
      permanent = null
      return
    }

    if (typeof result === 'number') {
      emitter.emitOnce('return', result)
      return
    }

    if (typeof result !== 'string') {
      emitter.emitOnce('error', new Error('invalid rewrite return value.'))
      return
    }

    this._route({
      pathname: result,
      method,
      rewrite_count
    }, emitter)
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


Router.REWRITE_LIMIT = 10

module.exports = Router
