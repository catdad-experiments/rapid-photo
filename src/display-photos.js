/* jshint browser: true */
/* global Promise */

(function (register) {
  var NAME = 'display-photos';
  var container = document.querySelector('#photos');

  register(NAME, function () {
    var context = this;
    var group;

    function onCatch(err) {
      context.events.emit('warn', err);
    }

    function onDeleteImage(opts) {
      context.storage.remove({ id: opts.id })
      .then(function() {
        opts.elem.parentElement.removeChild(opts.elem);
      })
      .catch(function (err) {
        context.events.emit('warn', new Error('failed to delete image'));
      });
    }

    function displayPhotoQuery(query) {
      var fragment = document.createDocumentFragment();

      return context.storage.each(query, function (record) {
        var div = document.createElement('div');
        div.classList.add('photo');

        var img = document.createElement('img');
        img.src = record.dataUrl;

        var delBtn = document.createElement('button');
        delBtn.classList.add('delete');
        delBtn.addEventListener('click', onDeleteImage.bind(null, {
          id: record.id,
          elem: div
        }));

        var icon = document.createElement('i');
        icon.classList.add('material-icons');
        icon.innerHTML = 'delete';

        delBtn.appendChild(icon);

        div.appendChild(img);
        div.appendChild(delBtn);

        fragment.appendChild(div);
      }).then(function () {
        container.innerHTML = '';
        container.appendChild(fragment);
      });
    }

    function onReset() {
      container.innerHTML = '';
    }

    function onCaptureStart(ev) {
      group = ev.group;
      container.innerHTML = 'Starting capture...';
    }

    function onCapturePhoto(ev) {
      container.innerHTML = 'Captured photo ' + (ev.idx + 1) + ' of ' + ev.total;
    }

    function onCaptureEnd() {
      container.innerHTML = 'Almost done...';

      displayPhotoQuery({
        group: group
      }).catch(onCatch);
    }

    function onCaptureAbort() {
      container.innerHTML = 'Stopping...';
    }

    function onViewAll() {
      displayPhotoQuery(null).catch(onCatch);
    }

    function onDeleteAll() {
      context.storage.removeAll()
      .then(function () {
        context.events.emit('reset');
      })
      .catch(onCatch);
    }

    context.events.on('capture-start', onCaptureStart);
    context.events.on('capture-photo', onCapturePhoto);
    context.events.on('capture-end', onCaptureEnd);
    context.events.on('capture-abort', onCaptureAbort);
    context.events.on('photo-viewall', onViewAll);
    context.events.on('photo-deleteall', onDeleteAll);
    context.events.on('reset', onReset);

    return function destroy() {
      context.events.off('capture-start', onCaptureStart);
      context.events.off('capture-photo', onCapturePhoto);
      context.events.off('capture-end', onCaptureEnd);
      context.events.off('capture-abort', onCaptureAbort);
      context.events.off('photo-viewall', onViewAll);
      context.events.off('photo-deleteall', onDeleteAll);
      context.events.off('reset', onReset);
    };
  });
}(window.registerModule));
