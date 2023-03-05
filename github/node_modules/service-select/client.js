(function () {
  'use strict';

  /**
   * Create a new auto complete.
   *
   * @param {Pagelet} pagelet
   * @api private
   */
  function autocomplete(pagelet) {
    var container = $(pagelet.placeholders)
      , target = pagelet.pagelet('target');

    //
    // Add support for adding new services
    //
    var select = container.find('header select').selectize({
      create: false,          // Do not allow creation of new values.
      maxOptions: 15,         // Maximum items in the dropdown.
      onItemAdd: function added(item) {
        var data;

        pagelet.data.services.some(function some(service) {
          if (item === service.name) data = service;
          return !!data;
        });

        target.render(data);
        $(target.placeholders).show();
      },
      render: {
        /**
         * Return an empty string so we can remove the `do you want to create bla
         * bla bla` from the UI.
         *
         * @returns {String}
         * @param {Function} escape Custom HTML escaper.
         * @api private
         */
        option_create: function create(data, escape) {
          return '';
        },

        /**
         * Custom layout renderer for items.
         *
         * @param {Object} item The thing returned from the server.
         * @param {Function} escape Custom HTML escaper.
         * @returns {String}
         * @api private
         */
        option: function option(item, escape) {
          var pretty = item.text.slice(0, 1).toUpperCase() + item.text.slice(1);
          return [
            '<div class="completed">',
              '<s class="icon '+ escape(item.text) +'"></s>',
              '<strong class="name">'+ escape(pretty) +'</strong>',
            '</div>'
          ].join('');
        }
      }
    })[0];

    //
    // Hide form fields when canceled.
    //
    container.on('click', 'button[name="cancel"]', function click() {
      if (select) {
        select.selectize.clear();       // Reset the auto select/dropdown.
      }

      target.render('');                // Nuke the HTML
      $(target.placeholders).hide();    // Hide the parent element.
    });
  }

  pipe.on('notifications:target:render', function (pagelet) {
    var notifications = pagelet.pipe.get('notifications');

    //
    // We're not extended with an autocomplete, bail out.
    //
    if (!('autocomplete' in notifications)) return;

    /**
     * Custom layout renderer for items.
     *
     * @param {Object} item The thing returned from the server.
     * @param {Function} escape Custom HTML escaper.
     * @returns {String}
     * @api private
     */
    $('input[name="package"]', pagelet.placeholders).selectize({
      valueField: 'name',
      labelField: 'name',
      searchField: 'name',
      maxOptions: 5,          // Maximum items in the dropdown.
      openOnFocus: false,     // Open dropdown on focus.
      createOnBlur: true,     // Blur input, create item.
      maxItems: 1,            // Only allow one module.
      create: true,
      load: function load(query, callback) {
        if (!query.length) return callback();

        notifications.autocomplete(query, function autocomplete(err, results) {
          if (err) return callback();
          callback(results);
        });
      },
      render: {
        /**
         * Return an empty string so we can remove the `do you want to create bla
         * bla bla` from the UI.
         *
         * @returns {String}
         * @param {Function} escape Custom HTML escaper.
         * @api private
         */
        option_create: function create(data, escape) {
          return '';
        },

        /**
         * Custom layout renderer for items.
         *
         * @param {Object} item The thing returned from the server.
         * @param {Function} escape Custom HTML escaper.
         * @returns {String}
         * @api private
         */
        option: function option(item, escape) {
          return [
            '<div class="completed">',
              '<strong class="name">'+ escape(item.name) +'</strong>',
             'string' === typeof item.desc ? '<span class="description">'+ escape(item.desc) +'</span>' : '',
            '</div>'
          ].join('');
        }
      }
    });
  });

  /**
   * Hacky as fuck but works like charm. When the targets are updated, update
   * the notifcations.
   *
   * @api private
   */
  function submission(pagelet) {
    pagelet.once('render', function loading() {
      pagelet.once('render', function update() {
        pipe.get('notifications').get();
      });
    });
  }

  pipe.on('notifications:render', autocomplete)
      .on('targets:submit', submission)
      .on('targets:render', autocomplete);
}());
