/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'controls';
  var controlsElem = document.querySelector('#controls');
  var captureBtn = document.querySelector('#capture');

  function createInput(id, defaultVal) {
    var elem = document.querySelector('#' + id);
    var fieldElem = elem.querySelector('.field');
    var lessElem = elem.querySelector('.less');
    var moreElem = elem.querySelector('.more');

    var value = Number(fieldElem.value);

    function onMore() {
      value += 1;
      fieldElem.value = value;
    }

    function onLess() {
      value -= 1;
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

  register(NAME, function () {
    var context = this;

    var countControl = createInput('count');

    function onCaptureBtn() {
      context.events.emit('capture', {
        count: countControl.value
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
    };
  });
}(window.registerModule));
