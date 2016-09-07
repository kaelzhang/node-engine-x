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

## Install

```sh
$ npm install engine-x --save
```

## Usage

```js
const nginx = require('engine-x')
```

## License

MIT
