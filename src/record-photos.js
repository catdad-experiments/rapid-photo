/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'record-photos';
  var capturing = false;

  var canvas = document.createElement('canvas');
  var canvasCtx = canvas.getContext('2d');

  function capture(video) {
    canvasCtx.drawImage(video, 0, 0);
    return canvas.toDataURL();
  }

  function pad(str) {
    str = str.toString();

    if (str.length >= 4) {
      return str;
    }

    return pad('0' + str);
  }

  function isNumber(val) {
    return Number(val) === val;
  }

  function start(video, opts, context) {
    var vw = video.videoWidth;
    var vh = video.videoHeight;

    var group = Date.now();
    var idx = 0;

    canvas.width = vw;
    canvas.height = vh;

    capturing = true;

    var count = opts.count;

    function onDone(err) {
      capturing = false;

      context.events.emit('stop-video');

      if (err) {
        context.events.emit('error', err);
      } else {
        context.events.emit('capture-end', {
          group: group
        });
      }
    }

    (function frame() {
      if (!capturing) {
        return onDone();
      }

      count -= 1;

      var dataUrl = capture(video);
      var photoIdx = idx++;
      var photoId = group + '_' + pad(photoIdx);

      context.storage.save({
        id: photoId,
        idx: photoIdx,
        group: group,
        dataUrl: dataUrl,
        date: (new Date()).toISOString()
      }).then(function () {
        context.events.emit('capture-photo', {
          idx: photoIdx,
          total: opts.count,
          dataUrl: dataUrl
        });

        if (count) {
          return setTimeout(frame, opts.interval);
        }

        return onDone();
      }).catch(onDone);
    }());

    context.events.emit('capture-start', {
      group: group
    });

    return function abort() {
      capturing = false;
    };
  }

  register(NAME, function () {
    var context = this;
    var options;

    function onVideo(video) {
      start(video, options, context);
      options = null;
    }

    function onCaptureInit(opts) {
      var cleanOpts = {
        count: Math.floor(isNumber(opts.count) ? opts.count : 1),
        interval: (isNumber(opts.interval) ? opts.interval : 1) * 1000
      };

      if (cleanOpts.count < 1) {
        return context.events.emit('warn', new Error('count should be 1 or higher'));
      }

      if (cleanOpts.interval < 0) {
        return context.events.emit('warn', new Error('interval should be 0 or higher'));
      }

      options = cleanOpts;

      // if all is well, start the video and start capturing photos
      context.events.once('video-playing', onVideo);
      context.events.emit('start-video', {
        quality: opts.quality
      });
    }

    function onCaptureAbort() {
      capturing = false;
    }

    context.events.on('capture-init', onCaptureInit);
    context.events.on('capture-abort', onCaptureAbort);

    return function destroy() {
      onCaptureAbort();

      context.events.off('capture-init', onCaptureInit);
      context.events.off('capture-abort', onCaptureAbort);
      context.events.off('video-playing', onVideo);
    };
  });
}(window.registerModule));
