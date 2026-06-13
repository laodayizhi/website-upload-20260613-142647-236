(function () {
  window.initMoviePlayer = function (videoId, buttonId, url) {
    const video = document.getElementById(videoId);
    const button = document.getElementById(buttonId);
    let loaded = false;
    let hls = null;

    if (!video || !button || !url) {
      return;
    }

    function bindStream() {
      if (loaded) {
        return;
      }
      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function startPlay() {
      bindStream();
      button.classList.add('is-hidden');
      video.controls = true;
      const playTask = video.play();
      if (playTask && typeof playTask.catch === 'function') {
        playTask.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', startPlay);
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlay();
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
