'use strict';

var Pagelet = require('pagelet')
  , async = require('async')
  , path = require('path');

Pagelet.extend({
  view: 'view.ejs',
  css:  'css.styl',
  js:   'client.js',

  //
  // Allow FORM submits to be streaming.
  //
  streaming: true,

  //
  // Force a name.
  //
  name: 'service-select',

  //
  // What data needs to be synced with the front-end.
  //
  query: ['services'],

  pagelets: {
    target: Pagelet.extend({
      view: 'target.ejs',
      streaming: true
    }).on(module)
  },

  //
  // External dependencies that should be included on the page using a regular
  // script tag. This dependency is needed for the `package.js` client file.
  //
  dependencies: [
    path.join(__dirname, '/selectize.default.css'),
    '//code.jquery.com/jquery-2.1.0.min.js',
    path.join(__dirname, '/selectize.js')
  ],

  /**
   * Respond to POST requests.
   *
   * @param {Object} fields The input fields.
   * @param {Object} files Optional uploaded files.
   * @param {Function} next Completion callback.
   * @api public
   */
  post: function post(fields, files, next) {
    if ('delete' in fields) {
      this.remove(fields, next);
    } else if ('add' in fields) {
      this.add(fields, next);
    } else {
      next(new Error('Invalid form data'));
    }
  },

  /**
   * Called when a new service has to be added.
   *
   * @param {Object} data The data to add.
   * @param {FUnction} next Continuation function.
   * @api public
   */
  add: function add(data, next) {
    throw new Error([
      'You, as a developer need to implement the `.add` method of the service',
      'select pagelet. If you dont know how to do this, see the documenation',
      'about Pagelet.extend({});'
    ].join(' '));
  },

  /**
   * A service has been removed from the UI.
   *
   * @param {Object} data The data containing the info about the service
   */
  remove: function remove(data, next) {
    throw new Error([
      'You, as a developer need to implement the `.remove` method of the service',
      'select pagelet. If you dont know how to do this, see the documenation',
      'about Pagelet.extend({});'
    ].join(' '));
  },

  /**
   * The available services that should be listed in the UI.
   *
   * @param {Function} next Continuation callback
   * @api public
   */
  services: function services(next) {
    throw new Error([
      'You, as a developer need to implement the `.services` method of the service',
      'select pagelet. If you dont know how to do this, see the documenation',
      'about Pagelet.extend({});'
    ].join(' '));
  },

  /**
   * List of added services that should be displayed in the UI.
   *
   * @param {Fucntion} next Continuation callback.
   * @api public
   */
  added: function added(next) {
    throw new Error([
      'You, as a developer need to implement the `.added` method of the service',
      'select pagelet. If you dont know how to do this, see the documenation',
      'about Pagelet.extend({});'
    ].join(' '));
  },

  /**
   * Render the HTML things.
   *
   * @param {Function} done Continuation callback.
   * @api public
   */
  get: function get(done) {
    var pagelet = this;

    async.parallel({
      services: this.services.bind(this),
      added: this.added.bind(this)
    }, function completed(err, data) {
      if (err) return done(err);

      data.services = data.services || [];
      data.added = data.added || [];

      ['services', 'added'].forEach(function transform(key) {
        if (Array.isArray(data[key])) return;

        data[key] = Object.keys(data[key]).map(function map(name) {
          var thing = data[key][name];
          thing.name = thing.name || name;

          return thing;
        });
      });

      data.description = pagelet.description;
      data.name = pagelet.name.replace('-', ' ');
      data.name = data.name.slice(0, 1).toUpperCase() + data.name.slice(1);

      done(err, data);
    });
  }
}).on(module);
