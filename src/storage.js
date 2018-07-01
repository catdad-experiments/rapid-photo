/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'storage';

  function enoent() {
    var err = new Error('enoent');
    err.code = 'ENOENT';

    return err;
  }

  register(NAME, function () {
    var context = this;

    var STORAGE = [];

    function save(data) {
      return new Promise(function (resolve, reject) {
        STORAGE.push(data);

        resolve(data);
      });
    }

    function remove(query) {
      return new Promise(function (resolve, reject) {
        STORAGE = STORAGE.filter(function (record) {
          return record.dataUrl !== query.dataUrl;
        });

        resolve();
      });
    }

    function removeAll() {
      return new Promise(function (resolve, reject) {
        STORAGE = [];

        resolve();
      });
    }

    function getAll(query) {
      return new Promise(function (resolve, reject) {
        var found = STORAGE.filter(function (record) {
          return query.dataUrl === '*' ||
            query.dataUrl === record.dataUrl;
        });

        if (found.lenth === 0) {
          return reject(enoent());
        }

        return resolve(found);
      });
    }

    function getFirst(query) {
      return getAll(query).then(function (found) {
        return Promise.resolve(found[0]);
      });
    }

    return {
      save: save,
      remove: remove,
      getAll: getAll,
      getFirst: getFirst
    };
  });
}(window.registerModule));
