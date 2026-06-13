
(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupHeader() {
        var header = document.querySelector("[data-header]");
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        function onScroll() {
            if (!header) {
                return;
            }
            header.classList.toggle("is-scrolled", window.scrollY > 20);
        }

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });

        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });

        show(0);
        restart();
    }

    function setupFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));

        scopes.forEach(function (scope) {
            var keyword = scope.querySelector("[data-filter-keyword]");
            var year = scope.querySelector("[data-filter-year]");
            var region = scope.querySelector("[data-filter-region]");
            var type = scope.querySelector("[data-filter-type]");
            var reset = scope.querySelector("[data-filter-reset]");
            var count = scope.querySelector("[data-result-count]");
            var empty = scope.querySelector("[data-empty-state]");
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));

            function normalized(value) {
                return (value || "").toString().trim().toLowerCase();
            }

            function apply() {
                var q = normalized(keyword && keyword.value);
                var y = normalized(year && year.value);
                var r = normalized(region && region.value);
                var t = normalized(type && type.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalized([
                        card.dataset.title,
                        card.dataset.region,
                        card.dataset.type,
                        card.dataset.year,
                        card.dataset.tags,
                        card.textContent
                    ].join(" "));
                    var ok = true;

                    if (q && haystack.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (y && normalized(card.dataset.year) !== y) {
                        ok = false;
                    }
                    if (r && normalized(card.dataset.region) !== r) {
                        ok = false;
                    }
                    if (t && normalized(card.dataset.type) !== t) {
                        ok = false;
                    }

                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = String(visible);
                }
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            var params = new URLSearchParams(window.location.search);
            var queryFromUrl = params.get("q");
            if (queryFromUrl && keyword) {
                keyword.value = queryFromUrl;
            }

            [keyword, year, region, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });

            if (reset) {
                reset.addEventListener("click", function () {
                    if (keyword) {
                        keyword.value = "";
                    }
                    if (year) {
                        year.value = "";
                    }
                    if (region) {
                        region.value = "";
                    }
                    if (type) {
                        type.value = "";
                    }
                    apply();
                });
            }

            apply();
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-play-button]");
            var status = player.querySelector("[data-player-status]");
            var source = player.dataset.src;
            var hls = null;
            var initialized = false;

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function playVideo() {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        setStatus("浏览器阻止了自动播放，请再次点击播放按钮");
                        if (button) {
                            button.classList.remove("is-hidden");
                        }
                    });
                }
            }

            function initialize() {
                if (!video || !source) {
                    setStatus("播放源缺失");
                    return;
                }

                if (initialized) {
                    playVideo();
                    return;
                }

                initialized = true;
                video.controls = true;
                setStatus("正在加载播放源...");

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus("播放源已就绪");
                        playVideo();
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setStatus("视频加载失败，请稍后重试");
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.addEventListener("loadedmetadata", function () {
                        setStatus("播放源已就绪");
                        playVideo();
                    }, { once: true });
                    video.addEventListener("error", function () {
                        setStatus("视频加载失败，请稍后重试");
                    }, { once: true });
                } else {
                    initialized = false;
                    setStatus("当前浏览器未加载 HLS 播放组件，请更换浏览器或检查网络");
                }
            }

            if (!video || !button) {
                return;
            }

            button.addEventListener("click", function () {
                button.classList.add("is-hidden");
                initialize();
            });

            video.addEventListener("play", function () {
                if (button) {
                    button.classList.add("is-hidden");
                }
                setStatus("正在播放");
            });

            video.addEventListener("pause", function () {
                if (!video.ended && button) {
                    button.classList.remove("is-hidden");
                }
            });

            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    ready(function () {
        setupHeader();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
