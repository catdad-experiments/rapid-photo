/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'storage';
  var STORAGE = [];
  var DB_NAME = 'rapid-photo';
  var STORE_NAME = 'photos';
  var DB;

  var INDEXED_DB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

  var hasDb = (function () {
    return !!INDEXED_DB;
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

  function dbError(ev) {
    var err = new Error(ev.target.error.message);
    err.code = ev.target.error.name;

    return err;
  }

  function db(operation, data) {
    return new Promise(function (resolve, reject) {
      var transaction = DB.transaction(STORE_NAME, 'readwrite');
      var store = transaction.objectStore(STORE_NAME);
      var request = store[operation](data);

      request.onerror = function (ev) {
        console.log(ev);

        reject(dbError(ev));
      };

      request.onsuccess = function (ev) {
        resolve(ev.target.result);
      };
    });
  }

  function save(data) {
    if (DB) {
      return db('add', data);
    }

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

      var request = window.indexedDB.open(DB_NAME);

      request.onsuccess = function (ev) {
        console.log(ev);
        resolve(ev.target.result);
      };

      request.onerror = function (ev) {
        console.log(ev);

        reject(dbError(ev));
      };

      request.onabort = function () {
        console.log('db abort');
      };

      request.oncomplete = function () {
        console.log('db complete');
      };

      request.onupgradeneeded = function (ev) {
        var db = ev.target.result;

        var store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: false });

//        store.createIndex('group', { unique: false });
      };
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
