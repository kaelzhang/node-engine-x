'use strict'

{
  root: '',
  routes: [
    {
      // location = /app
      location_is: '/app',

      // location
      location: /[a-z0-9]{7}\.html/i,
      rewrite: (url) => {
        return something
      }
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
      proxy_pass: 'http://online.com'
    }
  ]
}
