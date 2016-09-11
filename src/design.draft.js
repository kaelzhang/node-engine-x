'use strict'

{
  root: '',
  routes: [
    {
      // location = /app
      location_is: '/app',

      // location
      location: /-[a-z0-9]{7}\.html$/i,
      rewrite: (url, redirect) => something
    },

    {
      location: '/app',
      root: [
        '.neuron_modules/built',
        '.neuron_modules/compressed'
      ]
    },

    {
      location: '/combo',
      headers: {},
      proxy_headers: {},
      proxy_pass: 'http://online.com'
    }
  ]
}
