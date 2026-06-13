(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    document.querySelectorAll(".video-stage").forEach(function (stage) {
      var video = stage.querySelector("video");
      var button = stage.querySelector(".play-overlay");
      var url = stage.getAttribute("data-video");
      var connected = false;
      var hls = null;

      if (!video || !url) {
        return;
      }

      function connect() {
        if (connected) {
          return;
        }
        connected = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(url);
          hls.attachMedia(video);
          return;
        }
        video.src = url;
      }

      function start() {
        connect();
        stage.classList.add("is-playing");
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            stage.classList.remove("is-playing");
          });
        }
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          start();
        });
      }

      video.addEventListener("play", function () {
        stage.classList.add("is-playing");
      });

      video.addEventListener("ended", function () {
        stage.classList.remove("is-playing");
      });

      video.addEventListener("error", function () {
        stage.classList.remove("is-playing");
      });

      stage.addEventListener("click", function (event) {
        if (event.target === stage) {
          start();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  });
})();
