(function () {
  var shell = document.querySelector('.video-shell');
  var video = document.getElementById('videoPlayer');
  var button = document.querySelector('.play-button');
  if (!shell || !video || !button) {
    return;
  }

  var stream = shell.getAttribute('data-stream');
  var ready = false;
  var instance = null;

  function attach() {
    if (ready || !stream) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      instance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      instance.loadSource(stream);
      instance.attachMedia(video);
      ready = true;
      return;
    }

    video.src = stream;
    ready = true;
  }

  function start(event) {
    if (event) {
      event.preventDefault();
    }
    attach();
    button.classList.add('is-hidden');
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {
        button.classList.remove('is-hidden');
      });
    }
  }

  button.addEventListener('click', start);
  shell.addEventListener('click', function (event) {
    if (event.target === shell) {
      start(event);
    }
  });
  video.addEventListener('play', function () {
    button.classList.add('is-hidden');
  });
  video.addEventListener('pause', function () {
    if (video.currentTime === 0 || video.ended) {
      button.classList.remove('is-hidden');
    }
  });
  window.addEventListener('beforeunload', function () {
    if (instance && typeof instance.destroy === 'function') {
      instance.destroy();
    }
  });
})();
