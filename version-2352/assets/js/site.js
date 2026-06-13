(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupNavigation() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    hero.addEventListener('mouseenter', function () {
      if (timer) {
        window.clearInterval(timer);
      }
    });

    hero.addEventListener('mouseleave', restart);
    show(0);
    restart();
  }

  function setupPageFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

    scopes.forEach(function (scope) {
      var queryInput = scope.querySelector('[data-filter-query]');
      var typeSelect = scope.querySelector('[data-filter-type]');
      var yearSelect = scope.querySelector('[data-filter-year]');
      var regionSelect = scope.querySelector('[data-filter-region]');
      var reset = scope.querySelector('[data-filter-reset]');
      var visibleCount = scope.querySelector('[data-visible-count]');
      var empty = scope.querySelector('[data-filter-empty]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));

      function applyFilter() {
        var query = normalize(queryInput && queryInput.value);
        var type = normalize(typeSelect && typeSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var region = normalize(regionSelect && regionSelect.value);
        var count = 0;

        cards.forEach(function (card) {
          var searchText = normalize(card.getAttribute('data-search-text'));
          var cardType = normalize(card.getAttribute('data-type'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var cardRegion = normalize(card.getAttribute('data-region'));
          var matched = true;

          if (query && searchText.indexOf(query) === -1) {
            matched = false;
          }

          if (type && cardType !== type) {
            matched = false;
          }

          if (year && cardYear !== year) {
            matched = false;
          }

          if (region && cardRegion !== region) {
            matched = false;
          }

          card.hidden = !matched;

          if (matched) {
            count += 1;
          }
        });

        if (visibleCount) {
          visibleCount.textContent = String(count);
        }

        if (empty) {
          empty.hidden = count !== 0;
        }
      }

      [queryInput, typeSelect, yearSelect, regionSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });

      if (reset) {
        reset.addEventListener('click', function () {
          if (queryInput) {
            queryInput.value = '';
          }
          if (typeSelect) {
            typeSelect.value = '';
          }
          if (yearSelect) {
            yearSelect.value = '';
          }
          if (regionSelect) {
            regionSelect.value = '';
          }
          applyFilter();
        });
      }

      applyFilter();
    });
  }

  function movieCardTemplate(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card movie-card-poster">',
      '  <a class="poster-cover" href="' + escapeHtml(movie.url) + '" title="' + escapeHtml(movie.title) + '">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="poster-play">▶</span>',
      '    <span class="poster-type">' + escapeHtml(movie.type) + '</span>',
      '  </a>',
      '  <div class="poster-body">',
      '    <a class="card-title" href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a>',
      '    <p>' + escapeHtml(movie.oneLine || '') + '</p>',
      '    <div class="card-meta">',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '      <span>' + escapeHtml(movie.region) + '</span>',
      '    </div>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupGlobalSearch() {
    var form = document.querySelector('[data-global-search-form]');
    var results = document.querySelector('[data-search-results]');
    var count = document.querySelector('[data-search-count]');

    if (!form || !results) {
      return;
    }

    var input = form.querySelector('input[name="q"]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    var moviesCache = null;

    if (input) {
      input.value = initialQuery;
    }

    function render(movies, query) {
      var normalizedQuery = normalize(query);

      if (!normalizedQuery) {
        results.innerHTML = '';
        if (count) {
          count.textContent = '请输入关键词开始搜索';
        }
        return;
      }

      var matched = movies.filter(function (movie) {
        return normalize(movie.searchText).indexOf(normalizedQuery) !== -1;
      });

      results.innerHTML = matched.slice(0, 300).map(movieCardTemplate).join('');

      if (count) {
        count.textContent = '找到 ' + matched.length + ' 部影片' + (matched.length > 300 ? '，当前展示前 300 部' : '');
      }
    }

    function runSearch(query) {
      if (moviesCache) {
        render(moviesCache, query);
        return;
      }

      fetch('./assets/data/movies-search.json')
        .then(function (response) {
          return response.json();
        })
        .then(function (movies) {
          moviesCache = movies;
          render(moviesCache, query);
        })
        .catch(function () {
          if (count) {
            count.textContent = '搜索数据加载失败';
          }
        });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input ? input.value : '';
      var nextUrl = new URL(window.location.href);

      if (query) {
        nextUrl.searchParams.set('q', query);
      } else {
        nextUrl.searchParams.delete('q');
      }

      window.history.replaceState({}, '', nextUrl.toString());
      runSearch(query);
    });

    if (input) {
      input.addEventListener('input', function () {
        runSearch(input.value);
      });
    }

    runSearch(initialQuery);
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupPageFilters();
    setupGlobalSearch();
  });
})();
