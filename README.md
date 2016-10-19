[![Build Status](https://travis-ci.org/kaelzhang/node-engine-x.svg?branch=master)](https://travis-ci.org/kaelzhang/node-engine-x)
<!-- optional appveyor tst
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/kaelzhang/node-engine-x?branch=master&svg=true)](https://ci.appveyor.com/project/kaelzhang/node-engine-x)
-->
<!-- optional npm version
[![NPM version](https://badge.fury.io/js/engine-x.svg)](http://badge.fury.io/js/engine-x)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/engine-x.svg)](https://www.npmjs.org/package/engine-x)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/kaelzhang/node-engine-x.svg)](https://david-dm.org/kaelzhang/node-engine-x)
-->

# engine-x

EnGINe-X, nginx the node version, the reverse proxy for node.

`engine-x` is the subset of nginx, and only cares about the things inside the `server` directive of nginx, and does not care about:

- `listen`
- `server_name`

supported directives

- location
- rewrite
- root
- proxy_pass

## Install

```sh
$ npm install engine-x --save
```

## `nginx.Router`

```js
const {
  Router
} = require('engine-x')

const router = new Router({
  routes: [

    // The matching priority of locations follows the
    {
      // same as `location /app {...}` directive of nginx.
      location: '/app',

      // `root` could be a path or an array of paths, as well as below.
      root: '/path/to'
    },

    {
      // same as `location = /app/legacy {...}` directive of nginx
      location_is: '/app/legacy',
      root: '/legacy/path/to'
    },

    {
      // same as `location ~* -[a-z0-9]{7}\.png$/` directive of nginx
      location: /-[a-z0-9]{7}\.png$/i,

      // rewrite '/path/to/a-28dfeg0.png' -> '/path/to/a.png'
      rewrite: (url, redirect) => {
        return url.replace(/-[a-z0-79]{32}\.([a-z0-9]+)$/i, (m, p1) => {
          return `.${p1}`
        })
      }
    }
  ],

  // if no location matched, then use default root
  root: '/path/to/default/root',

  // if no location is matched,
  // and if no root specified, or no matched file found within root,
  // then will proxy pass to the server
  proxy_pass: 'http://domain.com'
})

router
.route({
  pathname: '/app/a-28dfeg0.png'
})
.on('found', (filename) => {
  filename // '/path/to/app/a.png'
})
// will not be called
.on('proxy-pass', (url) => {
})
```

## Directives

### root

Could be a path or an array of paths

### rewrite(url, redirect)

- **url** `URL` url to be rewritten
- **redirect** `function(redirect_url, is_permanent)`

nginx

```nginx
rewrite {pattern} {url_rewritten} {last};
```

- use `if` condition of javascript to handle `last` or `break` flag of nginx
- the return value of `rewrite(url)` is as `url_rewritten` if function `redirect` not called

##### nginx `redirect` flag

nginx

```nginx
rewrite {pattern} {redirect_url} redirect;
```

rewrite

```js
{
  rewrite: (url, redirect) => {
    redirect(redirect_url)
  }
}
```

##### nginx `permanent` flag

```nginx
rewrite {pattern} {redirect_url} permanent;
```

rewrite

```js
{
  rewrite: (url, redirect) => {
    // set `is_permanent` to `true`
    redirect(redirect_url, true)
  }
}
```

## Events

- `'not-found'`
- `'found'`
- `'error'`
- `'redirect'`
- `'return'`
- `'proxy-pass'`

## License

MIT
