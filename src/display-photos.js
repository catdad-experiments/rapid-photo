/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'display-photos';
  var container = document.querySelector('#photos');

  register(NAME, function () {
    var context = this;
    var group;

    function onCaptureStart(ev) {
      group = ev.group;
      container.innerHTML = '';
    }

    function onCaptureEnd() {
      var fragment = document.createDocumentFragment();

      context.storage.getAll({
        group: group
      }).then(function (photos) {
        photos.forEach(function (record) {
          var img = document.createElement('img');
          img.src = record.dataUrl;

          fragment.appendChild(img);
        });

        container.appendChild(fragment);
      });
    }

    context.events.on('capture-start', onCaptureStart);
    context.events.on('capture-end', onCaptureEnd);

    return function destroy() {
      context.events.off('capture-start', onCaptureStart);
      context.events.off('capture-end', onCaptureEnd);
    };
  });
}(window.registerModule));
