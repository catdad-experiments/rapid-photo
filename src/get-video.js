/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'get-video';

  var video = document.querySelector('#video');

  function pickDevice(devices, opts) {
    var sourceId = null;

    // enumerate all devices all array-like
    [].forEach.call(devices, function (device) {
      // we don't care about non-video
      if (device.kind !== 'videoinput') {
        return;
      }

      // use the first one by default
      if (!sourceId) {
        sourceId = device.deviceId;
      }

      // if this is a back camera, use it instead
      // TODO is this actually right? The internet example said yes,
      // but my phone says no.
      if (/back/i.test(device.label || '')) {
        sourceId = device.deviceId;
      }
    });

    // we didn't find any video input
    if (!sourceId) {
      throw new Error('no video input');
    }

    var constraints = {
      audio: false,
      video: {
        // these options only work with adapter.js
        // https://github.com/webrtc/adapter
        deviceId: sourceId
      }
    };

    if (opts.quality === 'high') {
      constraints.video.width = 10000;
      constraints.video.height = 10000;
    }

    return navigator.mediaDevices.getUserMedia(constraints);
  }

  function getVideo(opts) {
    return navigator.mediaDevices
      .enumerateDevices()
      .then(function (devices) {
        return pickDevice(devices, opts);
      });
  }

  function playVideo(source) {
    return new Promise(function (resolve, reject) {
      function onPlaying() {
        video.removeEventListener('playing', onPlaying);

        resolve(video);
      }

      video.srcObject = source;

      video.addEventListener('playing', onPlaying);
    });
  }

  register(NAME, function () {
    var context = this;
    var sourceMedia;

    function onStartVideo(opts) {
      var vidOpts = {
        quality: 'low'
      };

      if (opts && opts.quality) {
        vidOpts = opts.quality;
      }

      getVideo(opts)
      .then(function (source) {
        sourceMedia = source;
        return playVideo(source);
      })
      .then(function (video) {
        context.events.emit('video-playing', video);
      })
      .catch(function (err) {
        context.events.emit('error', err);
      });
    }

    function onStopVideo() {
      if (video && video.paused === false) {
        video.pause();
        video.srcObject = null;
      }

      if (sourceMedia) {
        sourceMedia.getTracks().forEach(function (track) {
          track.stop();
        });

        sourceMedia = null;
      }
    }

    context.events.on('start-video', onStartVideo);
    context.events.on('stop-video', onStopVideo);

    return function destroy() {
      onStopVideo();

      context.events.off('start-video', onStartVideo);
      context.events.off('stop-video', onStopVideo);
    };
  });
}(window.registerModule));
