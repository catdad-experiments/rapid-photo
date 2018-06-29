/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'display-photos';
  var container = document.querySelector('#photos');

  register(NAME, function () {
    var context = this;
    var photos;

    function onCaptureStart() {
      photos = [];
      container.innerHTML = '';
    }

    function onCaptureEnd() {
      var fragment = document.createDocumentFragment();

      photos.forEach(function (dataUrl) {
        var img = document.createElement('img');
        img.src = dataUrl;

        fragment.appendChild(img);
      });

      container.appendChild(fragment);

      // reset photos
      photos = null;
    }

    function onCapturePhoto(ev) {
      if (photos) {
        photos.push(ev.dataUrl);
      }
    }

    context.events.on('capture-start', onCaptureStart);
    context.events.on('capture-end', onCaptureEnd);
    context.events.on('capture-photo', onCapturePhoto);

    return function destroy() {
      context.events.off('capture-start', onCaptureStart);
      context.events.off('capture-end', onCaptureEnd);
      context.events.off('capture-photo', onCapturePhoto);
    };
  });
}(window.registerModule));
