const test = require('ava')
const make_array = require('make-array')
const {
  Router
} = require('..')

const node_path = require('path')
const PATH_FIXTURE = node_path.join(__dirname, 'fixtures')
const PROXY_HOST = 'http://aaaa.com'

const fixture = (...path) => node_path.join(PATH_FIXTURE, ...path)
const url = path => PROXY_HOST + path


const cases = [
  {
    d: 'nothing',
    c: {
    },
    p: '/a.js',
    'not-found': []
  },
  {
    d: 'default router: root',
    c: {
      root: fixture('src')
    },
    p: '/a.js',
    found: fixture('src', 'a.js')
  },
  {
    d: 'default router: root fallback',
    c: {
      root: [
        fixture('src'),
        fixture('src2')
      ]
    },
    p: '/b.js',
    found: fixture('src2', 'b.js')
  },
  {
    d: 'default router: proxy_pass, without root',
    c: {
      proxy_pass: PROXY_HOST
    },
    p: '/c.js',
    'proxy-pass': url('/c.js')
  },
  {
    d: 'default router: proxy_pass, with empty root',
    c: {
      root: [],
      proxy_pass: PROXY_HOST
    },
    p: '/c.js',
    'proxy-pass': url('/c.js')
  },
  {
    d: 'rewrite, default',
    c: {
      routes: [
        {
          location: '/',
          root: fixture('rewrite')
        },
        {
          location: /\.webp$/,
          rewrite: (path) => {
            return path.replace(/\.webp$/, '.png')
          }
        }
      ]
    },
    p: '/path/a.webp',
    found: fixture('rewrite', 'path', 'a.png')
  },
  {
    d: 'rewrite, too many rewrites',
    c: {
      routes: [
        {
          location: '/',
          rewrite: path => path
        }
      ]
    },
    p: '/path/a.png',
    error: 'too many rewrites.'
    // found: fixture('rewrite', 'path', 'a.png')
  }
]


const EVENTS = [
  'found',
  'not-found',
  'error',
  'proxy-pass'
]

cases.forEach((c) => {
  const _test = c.only
    ? test.cb.only
    : test.cb

  _test(c.d, t => {
    const router = new Router(c.c)

    EVENTS.some((type) => {
      if (type in c) {
        router.route({
          pathname: c.p
        }).on(type, (...args) => {
          if (type === 'error') {
            t.is(args[0].message, c.error)
            t.end()
            return
          }

          t.deepEqual(args.sort(), make_array(c[type]).sort())
          t.end()

        }).on('error', (e) => {
          if (!c.error) {
            console.error(e.stack)
            t.fail()
            t.end()
          }
        })

        return true
      }
    })

  })
})
