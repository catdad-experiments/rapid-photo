/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'record-photos';
  var capturing = false;

  var canvas = document.createElement('canvas');
  var canvasCtx = canvas.getContext('2d');

  function capture(video, context) {
    canvasCtx.drawImage(video, 0, 0);
    var data = canvas.toDataURL();

    context.events.emit('capture-photo', {
      dataUrl: data
    });
  }

  function start(video, opts, context) {
    var vw = video.videoWidth;
    var vh = video.videoHeight;

    canvas.width = vw;
    canvas.height = vh;

    capturing = true;

    var count = opts.count || 1;
    var interval = (opts.interval || 1) * 1000;

    function onDone() {
      context.events.emit('stop-video');
      context.events.emit('capture-end');
    }

    setTimeout(function frame() {
      if (capturing) {
        count -= 1;
        capture(video, context);

        if (count) {
          return setTimeout(frame, interval);
        }
      }

      return onDone();
    }, interval);

    context.events.emit('capture-start');
  }

  register(NAME, function () {
    var context = this;
    var options;

    function onVideo(video) {
      start(video, options, context);
      options = null;
    }

    function onCapture(opts) {
      options = opts;
      context.events.once('video-playing', onVideo);
      context.events.emit('start-video');
    }

    context.events.on('capture', onCapture);

    return function destroy() {
      capturing = false;

      context.events.off('capture', onCapture);
      context.events.off('video-playing', onVideo);
    };
  });
}(window.registerModule));
