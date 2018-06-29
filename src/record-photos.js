/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'record-photos';
  var PHOTO_COUNT = 10;
  var INTERVAL = 1000;
  var capturing = false;

  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');

  function capture(video, context) {
    context.drawImage(video, 0, 0);
    var data = canvas.toDataURL();

    context.events.emit('capture-photo', {
      dataUrl: data
    });
  }

  function start(video, context) {
    var vw = video.videoWidth;
    var vh = video.videoHeight;

    canvas.width = vw;
    canvas.height = vh;

    capturing = true;

    var count = PHOTO_COUNT;

    function onDone() {
      context.events.emit('stop-video');
      context.events.emit('capture-ended');
    }

    setTimeout(function frame() {
      if (capturing) {
        count -= 1;
        capture(video);

        if (count) {
          return setTimeout(frame, INTERVAL);
        }
      }

      return onDone();
    }, INTERVAL);

    context.events.emit('capture-started');
  }

  register(NAME, function () {
    var context = this;
    var sourceMedia;

    function onVideo(video) {
      start(video, context);
    }

    context.events.on('video-playing', onVideo);

    return function destroy() {
      capturing = false;

      context.events.off('video-playing', onVideo);
    };
  });
}(window.registerModule));
