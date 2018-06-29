/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'record-photos';
  var PHOTO_COUNT = 10;
  var INTERVAL = 1000;
  var capturing = false;

  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');

  function capture(video) {
    context.drawImage(video, 0, 0);
    var data = canvas.toDataURL();

    console.log('captured photo of %s length', data.length);
  }

  function onVideo(video) {
    var vw = video.videoWidth;
    var vh = video.videoHeight;

    canvas.width = vw;
    canvas.height = vh;

    capturing = true;

    var count = PHOTO_COUNT;

    setTimeout(function frame() {
      if (!capturing) {
        return;
      }

      count -= 1;
      capture(video);

      if (count) {
        setTimeout(frame, INTERVAL);
      }
    }, INTERVAL);
  }

  register(NAME, function () {
    var context = this;
    var sourceMedia;

    context.events.on('video-playing', onVideo);

    return function destroy() {
      capturing = false;

      context.events.off('video-playing', onVideo);
    };
  });
}(window.registerModule));
