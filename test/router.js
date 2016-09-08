const test = require('ava')
const {
  Router
} = require('..')

const node_path = require('path')

const PATH_SRC = node_path.join(__dirname, 'fixtures', 'src')
const PATH_SRC2 = node_path.join(__dirname, 'fixtures', 'src2')

const src = path => node_path.join(PATH_SRC, path)
const src2 = path => node_path.join(PATH_SRC2, path)

const PROXY_HOST = 'http://aaaa.com'

const cases = [
  {
    d: 'nothing',
    c: {
    },
    p: '/a.js',
    e: [null, null]
  },
  {
    d: 'default router: root',
    c: {
      root: PATH_SRC
    },
    p: '/a.js',
    e: [src('a.js'), null]
  },
  {
    d: 'default router: root fallback',
    c: {
      root: [
        PATH_SRC,
        PATH_SRC2
      ]
    },
    p: '/b.js',
    e: [src2('b.js'), null]
  },
  {
    d: 'default router: proxy_pass, without root',
    c: {
      proxy_pass: PROXY_HOST
    },
    p: '/c.js',
    e: [null, PROXY_HOST + '/c.js']
  },
  {
    d: 'default router: proxy_pass, with empty root',
    c: {
      root: [],
      proxy_pass: PROXY_HOST
    },
    p: '/c.js',
    e: [null, PROXY_HOST + '/c.js']
  }
]


cases.forEach((c) => {
  test.cb(c.d, t => {
    new Router(c.c).route({
      pathname: c.p
    }, (filename, url) => {
      const [ef, eu] = c.e
      t.is(ef, filename)
      t.is(eu, url)
      t.end()
    })
  })
})
