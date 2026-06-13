(function() {
    var toggles = document.querySelectorAll('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    toggles.forEach(function(toggle) {
        toggle.addEventListener('click', function() {
            if (mobileNav) {
                mobileNav.classList.toggle('is-open');
            }
        });
    });

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var activeIndex = 0;
        var timer = null;

        function setHero(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function startHero() {
            stopHero();
            timer = window.setInterval(function() {
                setHero(activeIndex + 1);
            }, 5200);
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                var index = Number(dot.getAttribute('data-hero-dot')) || 0;
                setHero(index);
                startHero();
            });
        });

        hero.addEventListener('mouseenter', stopHero);
        hero.addEventListener('mouseleave', startHero);
        startHero();
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function(scope) {
        var input = scope.querySelector('[data-filter-input]');
        var buttons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-button]'));
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var empty = scope.querySelector('[data-empty-state]');
        var buttonValue = '';

        function applyFilter() {
            var inputValue = input ? input.value.trim().toLowerCase() : '';
            var visible = 0;

            cards.forEach(function(card) {
                var text = card.getAttribute('data-filter') || '';
                var matchedInput = !inputValue || text.indexOf(inputValue) !== -1;
                var matchedButton = !buttonValue || text.indexOf(buttonValue) !== -1;
                var matched = matchedInput && matchedButton;

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var initial = params.get('q');
            if (initial) {
                input.value = initial;
            }
            input.addEventListener('input', applyFilter);
        }

        buttons.forEach(function(button) {
            button.addEventListener('click', function() {
                buttons.forEach(function(item) {
                    item.classList.remove('is-active');
                });
                button.classList.add('is-active');
                buttonValue = (button.getAttribute('data-filter-button') || '').toLowerCase();
                applyFilter();
            });
        });

        applyFilter();
    });
})();

function createMoviePlayer(videoUrl) {
    var video = document.getElementById('movie-video');
    var cover = document.querySelector('[data-play-button]');
    var initialized = false;

    if (!video || !cover || !videoUrl) {
        return;
    }

    function bindVideo() {
        if (initialized) {
            return;
        }

        initialized = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 60
            });
            hls.loadSource(videoUrl);
            hls.attachMedia(video);
        } else {
            video.src = videoUrl;
        }
    }

    function playVideo() {
        bindVideo();
        cover.classList.add('is-hidden');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function() {});
        }
    }

    cover.addEventListener('click', playVideo);
    video.addEventListener('click', function() {
        if (video.paused) {
            playVideo();
        }
    });
}
