'use strict'

const util = require('util')

const MODIFIER_CASE_INSENSATIVE = '~*'
const MODIFIER_CASE_SENSATIVE = '~'
const MODIFIER_PREFIX = ''
const MODIFIER_EQUAL = '='
const MODIFIER_PREFIX_LONGEST = '^~'
const MODIFIER_FUNCTION = 'func'


const MATCHER_MAP = {
  [MODIFIER_CASE_INSENSATIVE]: (matcher, pathname) => {
    return matcher === pathname
  },

  [MODIFIER_PREFIX]: prefix_match,
  [MODIFIER_PREFIX_LONGEST]: prefix_match,
  [MODIFIER_CASE_INSENSATIVE]: regex_match,
  [MODIFIER_CASE_SENSATIVE]: regex_match,
  [MODIFIER_FUNCTION]: (matcher, pathname) => {
    return matcher(pathname)
  }
}


class Location {

  // Sanitize location directive.
  // Dirty works
  // @param {Object} location, the location object
  static from ({
    location,
    location_is,
    longest
  }) {

    function factory () {
      return new Location({
        location,
        modifier
      })
    }

    let modifier

    if (typeof location === 'function') {
      modifier = MODIFIER_FUNCTION
      return factory()
    }

    if (location_is) {
      location = location_is
      modifier = MODIFIER_EQUAL

      return factory()
    }

    if (util.isRegExp(location)) {
      modifier = ~location.flags.indexOf('i')
        ? MODIFIER_CASE_INSENSATIVE
        : MODIFIER_CASE_SENSATIVE

      return factory()
    }

    if (longest) {
      modifier = MODIFIER_PREFIX_LONGEST
    }

    if (typeof location === 'string') {
      modifier = modifier || MODIFIER_PREFIX

      return factory()
    }

    throw new TypeError('invalid location "${location}"')
  }

  constructor ({
    location,
    modifier = MODIFIER_PREFIX
  }) {
    this._modifier = modifier
    this._location = location

    this._length = modifier === MODIFIER_PREFIX
      || modifier === MODIFIER_PREFIX_LONGEST
      ? this._location.length
      : 0
  }

  // @returns {Object}
  // - last `Boolean`
  // - match `Boolean`
  match (pathname) {
    const matcher = MATCHER_MAP[this._modifier]
    const match = matcher(this._location, pathname)

    return {
      match,
      modifier: this._modifier
    }
  }

  length () {
    return this._length
  }
}


Location.MODIFIERS = {
  MODIFIER_CASE_INSENSATIVE,
  MODIFIER_CASE_SENSATIVE,
  MODIFIER_PREFIX,
  MODIFIER_EQUAL,
  MODIFIER_PREFIX_LONGEST,
  MODIFIER_FUNCTION
}


function regex_match (matcher, pathname) {
  return matcher.test(pathname)
}

function prefix_match (matcher, pathname) {
  return pathname.indexOf(matcher) === 0
}


module.exports = Location
