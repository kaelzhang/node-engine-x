const test = require('ava')
const Nginx = require('..')

const node_path = require('path')

const path_src = node_path.join(__dirname, 'fixtures', 'src')
const src = path => node_path.join(path_src, path)

const config = {
  root: path_src
}

const cases = [
  {
    d: '',
    p: '/a.js',
    e: [src('a.js'), null]
  }
]


cases.forEach((c) => {
  test.cb(c.d, t => {
    new Nginx(config).route(c.p, (filename, url) => {
      const [ef, eu] = c.e
      t.is(ef, filename)
      t.is(eu, url)
      t.end()
    })
  })
})
