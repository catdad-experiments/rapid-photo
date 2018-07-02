/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'controls';
  var controlsElem = document.querySelector('#controls');
  var captureBtn = document.querySelector('#capture');

  function createInput(id, increment) {
    var elem = document.querySelector('#' + id);
    var fieldElem = elem.querySelector('.field');
    var lessElem = elem.querySelector('.less');
    var moreElem = elem.querySelector('.more');

    var value = Number(fieldElem.value);

    function onMore() {
      value = increment(value, 1);
      fieldElem.value = value;
    }

    function onLess() {
      value = increment(value, -1);
      fieldElem.value = value;
    }

    lessElem.addEventListener('click', onLess);
    moreElem.addEventListener('click', onMore);

    return Object.defineProperties({}, {
      value: {
        get: function () {
          return value;
        },
        set: function (val) {
          fieldElem.value = value = val;
        }
      },
      destroy: {
        value: function () {
          lessElem.removeEventListener('click', onLess);
          moreElem.removeEventListener('click', onMore);
        }
      }
    });
  }

  function incrementCount(value, mod) {
    if (value === 1 && mod < 0) {
      return value;
    }

    return value + mod;
  }

  function incrementInterval(value, mod) {
    var increments = [0.03, 0.1, 0.5, 1, 1.5, 2, 3];
    var idx = increments.indexOf(value);

    if (idx === -1 || idx === (increments.length - 1)) {
      return value + mod;
    }

    if (idx === 0 && mod === -1) {
      return value;
    }

    return increments[idx + mod];
  }

  register(NAME, function () {
    var context = this;

    var countControl = createInput('count', incrementCount);
    var intervalControl = createInput('interval', incrementInterval);

    function onCaptureBtn() {
      context.events.emit('capture', {
        count: countControl.value,
        interval: intervalControl.value
      });
    }

    function onCaptureStart() {
      captureBtn.classList.add('active');
    }

    function onCaptureEnd() {
      controlsElem.classList.add('compact');
      captureBtn.classList.remove('active');
    }

    captureBtn.addEventListener('click', onCaptureBtn);
    context.events.on('capture-start', onCaptureStart);
    context.events.on('capture-end', onCaptureEnd);

    return function destroy() {
      captureBtn.removeEventListener('click', onCaptureBtn);
      context.events.off('capture-start', onCaptureStart);
      context.events.off('capture-end', onCaptureEnd);

      countControl.destroy();
      intervalControl.destroy();
    };
  });
}(window.registerModule));
