/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'display-photos';
  var container = document.querySelector('#photos');

  register(NAME, function () {
    var context = this;
    var group;

    function onReset() {
      container.innerHTML = '';
    }

    function onCaptureStart(ev) {
      group = ev.group;
      container.innerHTML = 'Starting capture...';
    }

    function onCapturePhoto(ev) {
      container.innerHTML = 'Captured photo ' + (ev.idx + 1) + ' of ' + ev.total;
    }

    function onCaptureEnd() {
      container.innerHTML = 'Almost done...';

      var fragment = document.createDocumentFragment();

      context.storage.each({
        group: group
      }, function (record) {
        var img = document.createElement('img');
        img.src = record.dataUrl;

        fragment.appendChild(img);
      }).then(function () {
        container.appendChild(fragment);
      });
    }

    function onDeleteAll() {
      context.storage.removeAll().then(function () {
        context.events.emit('reset');
      }).catch(function (err) {
        context.events.emit('warn', err);
      });
    }

    context.events.on('capture-start', onCaptureStart);
    context.events.on('capture-photo', onCapturePhoto);
    context.events.on('capture-end', onCaptureEnd);
    context.events.on('photo-deleteall', onDeleteAll);
    context.events.on('reset', onReset);

    return function destroy() {
      context.events.off('capture-start', onCaptureStart);
      context.events.off('capture-photo', onCapturePhoto);
      context.events.off('capture-end', onCaptureEnd);
      context.events.off('photo-deleteall', onDeleteAll);
      context.events.off('reset', onReset);
    };
  });
}(window.registerModule));
