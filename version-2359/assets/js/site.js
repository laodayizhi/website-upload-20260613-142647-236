(function () {
    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startHero() {
            stopHero();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startHero();
            });
        });

        hero.addEventListener('mouseenter', stopHero);
        hero.addEventListener('mouseleave', startHero);
        startHero();
    }

    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    document.addEventListener('error', function (event) {
        var target = event.target;
        if (target && target.tagName === 'IMG') {
            target.classList.add('is-missing-image');
        }
    }, true);

    Array.prototype.slice.call(document.querySelectorAll('[data-global-search]')).forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input) {
                return;
            }
            var value = input.value.trim();
            if (!value) {
                return;
            }
            event.preventDefault();
            var action = form.getAttribute('action') || 'search.html';
            window.location.href = action + '?q=' + encodeURIComponent(value);
        });
    });

    var filterGrid = document.querySelector('[data-filter-grid]');
    var searchInput = document.querySelector('.movie-search-input');
    var filterSelects = Array.prototype.slice.call(document.querySelectorAll('.movie-filter-select'));
    var emptyState = document.querySelector('[data-empty-state]');

    if (filterGrid) {
        var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.searchable-card'));
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        if (searchInput && initialQuery) {
            searchInput.value = initialQuery;
        }

        function normalize(value) {
            return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
        }

        function applyFilters() {
            var query = normalize(searchInput ? searchInput.value : '');
            var visibleCount = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-search'),
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-category')
                ].join(' '));

                var matched = !query || haystack.indexOf(query) !== -1;

                filterSelects.forEach(function (select) {
                    var key = select.getAttribute('data-filter');
                    var value = normalize(select.value);
                    if (!value) {
                        return;
                    }
                    var current = normalize(card.getAttribute('data-' + key));
                    if (current !== value) {
                        matched = false;
                    }
                });

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visibleCount === 0);
            }
        }

        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);
        }

        filterSelects.forEach(function (select) {
            select.addEventListener('change', applyFilters);
        });

        applyFilters();
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var source = player.getAttribute('data-src');
        var fallback = player.getAttribute('data-fallback');
        var hlsInstance = null;
        var loaded = false;

        if (!video || !button) {
            return;
        }

        function setVideoSource() {
            if (loaded) {
                return;
            }

            if (source && window.Hls && window.Hls.isSupported() && window.location.protocol !== 'file:') {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                loaded = true;
                return;
            }

            if (source && video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                loaded = true;
                return;
            }

            if (fallback) {
                video.src = fallback;
                loaded = true;
            }
        }

        function playVideo() {
            setVideoSource();
            button.classList.add('is-hidden');
            video.setAttribute('controls', 'controls');
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        }

        button.addEventListener('click', playVideo);
        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}());
