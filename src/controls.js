/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'controls';
  var captureBtn = document.querySelector('#capture');

  register(NAME, function () {
    var context = this;

    function onCaptureBtn() {
      // starting a new video will begin a capture
      context.events.emit('start-video');
    }

    function onCaptureStart() {
      captureBtn.classList.add('active');
    }

    function onCaptureEnd() {
      captureBtn.classList.remove('active');
      captureBtn.classList.add('compact');
    }

    captureBtn.addEventListener('click', onCaptureBtn);
    context.events.on('capture-start', onCaptureStart);
    context.events.on('capture-end', onCaptureEnd);

    return function destroy() {
      captureBtn.removeEventListener('click', onCaptureBtn);
      context.events.off('capture-start', onCaptureStart);
      context.events.off('capture-end', onCaptureEnd);
    };
  });
}(window.registerModule));
