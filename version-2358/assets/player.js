(function () {
  var hlsUrl = "https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js";
  var hlsLoading = null;

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsLoading) {
      return hlsLoading;
    }
    hlsLoading = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = hlsUrl;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsLoading;
  }

  function initPlayer(panel) {
    var stream = panel.getAttribute("data-stream");
    var video = panel.querySelector("video");
    var trigger = panel.querySelector("[data-play-trigger]");
    var initialized = false;
    var busy = false;
    var hlsInstance = null;

    if (!stream || !video || !trigger) {
      return;
    }

    function attachNative() {
      video.src = stream;
      initialized = true;
      return Promise.resolve();
    }

    function attachHls() {
      return loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          initialized = true;
          return new Promise(function (resolve) {
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
              resolve();
            });
            window.setTimeout(resolve, 1400);
          });
        }
        return attachNative();
      }).catch(function () {
        return attachNative();
      });
    }

    function prepare() {
      if (initialized) {
        return Promise.resolve();
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        return attachNative();
      }
      return attachHls();
    }

    function play() {
      if (busy) {
        return;
      }
      busy = true;
      trigger.classList.add("is-loading");
      prepare().then(function () {
        trigger.classList.add("is-hidden");
        return video.play();
      }).catch(function () {
        trigger.classList.remove("is-hidden");
      }).finally(function () {
        trigger.classList.remove("is-loading");
        busy = false;
      });
    }

    trigger.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!initialized || video.paused) {
        play();
      }
    });
    video.addEventListener("playing", function () {
      trigger.classList.add("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll(".js-video-player")).forEach(initPlayer);
  });
})();
