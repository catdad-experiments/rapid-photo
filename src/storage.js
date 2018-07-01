/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'storage';
  var STORAGE = [];
  var DB;

  var hasDb = (function () {
    return typeof indexedDB !== undefined;
  }());

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

  function initIndexedDb() {
    var version = 1;

    return new Promise(function (resolve, reject) {
      if (!hasDb) {
        return setTimeout(reject, 0, new Error(
          'there is no storage, there may be limited functionality'
        ));
      }
    });
  }

  function onDbAvailable() {}

  register(NAME, function () {
    var context = this;

    initIndexedDb().then(function (db) {
      DB = db;
      onDbAvailable();
    }).catch(function (err) {
      context.events.emit('warn', err);
    });

    return {
      save: save,
      remove: remove,
      removeAll: removeAll,
      get: get,
      getAll: getAll
    };
  });
}(window.registerModule));
