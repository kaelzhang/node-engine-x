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
    d: 'rewrite, will route again after rewroten',
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
  },
  {
    d: 'rewrite, redirect',
    c: {
      routes: [
        {
          location: '/',
          rewrite: (url, redirect) => {
            redirect('http://google.com', true)
          }
        }
      ]
    },
    p: '/redirect',
    redirect: ['http://google.com', true]
  },
  {
    d: 'rewrite, return status',
    c: {
      routes: [{
        location: '/',
        rewrite: () => {
          return 404
        }
      }]
    },
    p: '/any/pathname',
    'return': 404
  },
  {
    d: 'returns',
    c: {
      routes: [{
        location: '/',
        returns: 404
      }]
    },
    p: '/any/pathname',
    'return': 404
  },
  {
    d: 'function location: not-found',
    c: {
      routes: [{
        location: (pathname) => {
          return pathname === '/abc'
        },
        returns: 200
      }]
    },
    p: '/abcd',
    'not-found': []
  },
  {
    d: 'function location: found -> returns',
    c: {
      routes: [{
        location: (pathname) => {
          return pathname === '/a.png'
        },
        returns: 200
      }]
    },
    p: '/a.png',
    'return': 200
  },
  {
    d: 'normal match prefix',
    c: {
      routes: [
        {
          location: '/',
          root: fixture('src')
        }
      ]
    },
    p: '/a.js',
    found: fixture('src', 'a.js')
  },
  {
    d: 'match longest: ^~, prior to regex',
    c: {
      routes: [{
        location: '/a',
        returns: 200
      }, {
        location: /b/,
        returns: 400
      }, {
        location: '/a/b',
        longest: true,
        returns: 300
      }]
    },
    p: '/a/b/c',
    'return': 300
  }
]

console.log(`${cases.length} test cases total.`)

const EVENTS = [
  'found',
  'not-found',
  'error',
  'proxy-pass',
  'redirect',
  'return'
]

cases.forEach((c) => {
  const _test = c.only
    ? test.cb.only
    : test.cb

  _test(c.d, t => {
    const router = new Router(c.c)

    EVENTS.some((type) => {
      if (type in c) {
        let called

        router.route({
          pathname: c.p
        }).on(type, (...args) => {
          if (called) {
            t.fail('called more than once')
            t.end()
            return
          }
          called = true

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
