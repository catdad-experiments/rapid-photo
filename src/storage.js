/* jshint browser: true */
/* global Promise, Dexie */

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
      return memo || query[key] === record[key];
    }, false);
  }

  function save(data) {
    if (DB) {
      return DB.photos.add(data);
    }

    return new Promise(function (resolve, reject) {
      STORAGE.push(data);

      resolve(data);
    });
  }

  function removeAll() {
    if (DB) {
      return DB.photos.where().delete().then(function () {
        return Promise.resolve();
      });
    }

    return new Promise(function (resolve, reject) {
      STORAGE = [];

      resolve();
    });
  }

  function remove(query) {
    if (DB) {
      return DB.photos.where(query).delete().then(function () {
        return Promise.resolve();
      });
    }

    return new Promise(function (resolve, reject) {
      STORAGE = STORAGE.filter(function (record) {
        return !match(query, record);
      });

      resolve();
    });
  }

  function getAll(query) {
    if (DB) {
      return DB.photos.where(query).toArray();
    }

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
    if (DB) {
      return DB.photos.where(query).first();
    }

    return getAll(query).then(function (found) {
      return Promise.resolve(found[0]);
    });
  }

  function initIndexedDb() {
    return new Promise(function (resolve, reject) {
      function done(err, data) {
        setTimeout(function () {
          if (err) {
            return reject(err);
          }

          return resolve(data);
        }, 0);
      }

      if (!hasDb) {
        return done(new Error('there is no storage, there may be limited functionality'));
      }

      var db = new Dexie(DB_NAME);
      db.version(1).stores({
        photos: '&id, group'
      });

      return done(null, db);
    });
  }

  function onDbAvailable() {}

  register(NAME, function () {
    var context = this;

    initIndexedDb().then(function (db) {
      DB = db;
      onDbAvailable();

      console.log('db is initialized and available');
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
