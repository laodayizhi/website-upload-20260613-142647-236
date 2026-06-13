(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupPlayer(panel) {
    var video = panel.querySelector('video[data-src]');
    var playButton = panel.querySelector('[data-play-button]');
    var hlsInstance = null;
    var initialized = false;

    if (!video) {
      return;
    }

    function hideOverlay() {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    }

    function showOverlay() {
      if (playButton) {
        playButton.classList.remove('is-hidden');
      }
    }

    function attachSource() {
      var source = video.getAttribute('data-src');

      if (!source || initialized) {
        return;
      }

      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.load();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            hlsInstance.destroy();
            hlsInstance = null;
            initialized = false;
            showOverlay();
          }
        });
        return;
      }

      video.src = source;
      video.load();
    }

    function play() {
      attachSource();
      hideOverlay();

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          showOverlay();
        });
      }
    }

    if (playButton) {
      playButton.addEventListener('click', function (event) {
        event.preventDefault();
        play();
      });
    }

    panel.addEventListener('click', function (event) {
      if (event.target === video) {
        return;
      }

      if (event.target.closest && event.target.closest('[data-play-button]')) {
        return;
      }
    });

    video.addEventListener('play', hideOverlay);
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        showOverlay();
      }
    });
    video.addEventListener('ended', showOverlay);

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
  });
})();
