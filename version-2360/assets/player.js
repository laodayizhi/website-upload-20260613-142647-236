import { H as Hls } from './hls.js';

const players = document.querySelectorAll('[data-player]');

players.forEach(function (player) {
  const video = player.querySelector('.movie-video');
  const cover = player.querySelector('.player-cover');
  let hls = null;
  let ready = false;

  const attachSource = function () {
    if (!video || ready) {
      return;
    }

    const source = video.getAttribute('data-src');

    if (!source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      ready = true;
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      ready = true;
    }
  };

  const playVideo = function () {
    attachSource();

    if (cover) {
      cover.hidden = true;
    }

    if (video) {
      video.controls = true;
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          video.controls = true;
        });
      }
    }
  };

  if (cover) {
    cover.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('click', playVideo);
    video.addEventListener('ended', function () {
      if (hls && typeof hls.stopLoad === 'function') {
        hls.stopLoad();
      }
    });
  }
});
