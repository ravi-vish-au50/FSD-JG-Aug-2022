'use strict';

var Page = require('bigpipe').Page;

Page.extend({
  path: '/',              // HTTP route we should respond to.
  view: './index.ejs',    // The base template we need to render.
  pagelets: {             // The pagelets that should be rendered.
    'not relevant, not used': require('../../').extend({
      description: 'ill create my own service, with blackjack and hookers.',
      add: function (data, next) { next(); },
      services: function (next) { next(undefined, [{ name: 'foo' }]); },
      added: function (next) { next(undefined, [{ name: 'foo' }, { name: 'bar'}]); },
      name: 'notifications'
    })
  }
}).on(module);
