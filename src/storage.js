/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'storage';
  var STORAGE = [];

  function enoent() {
    var err = new Error('enoent');
    err.code = 'ENOENT';

    return err;
  }

  // all keys in the query must match the key in
  // the record of be *
  function match(query, record) {
    return Object.keys(query).reduce(function (memo, key) {
      return memo || query[key] === '*' || query[key] === record[key];
    }, false);
  }

  function save(data) {
    return new Promise(function (resolve, reject) {
      STORAGE.push(data);

      resolve(data);
    });
  }

  function removeAll() {
    return new Promise(function (resolve, reject) {
      STORAGE = [];

      resolve();
    });
  }

  function remove(query) {
    return new Promise(function (resolve, reject) {
      STORAGE = STORAGE.filter(function (record) {
        return !match(query, record);
      });

      resolve();
    });
  }

  function getAll(query) {
    return new Promise(function (resolve, reject) {
      var found = STORAGE.filter(function (record) {
        return match(query, record);
      });

      if (found.lenth === 0) {
        return reject(enoent());
      }

      return resolve(found);
    });
  }

  function get(query) {
    return getAll(query).then(function (found) {
      return Promise.resolve(found[0]);
    });
  }

  register(NAME, function () {
    var context = this;

    return {
      save: save,
      remove: remove,
      removeAll: removeAll,
      get: get,
      getAll: getAll
    };
  });
}(window.registerModule));
