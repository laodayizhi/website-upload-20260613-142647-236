(function () {
  var toggle = document.querySelector('.mobile-toggle');
  var panel = document.querySelector('.mobile-panel');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      play();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        restart();
      });
    });

    show(0);
    play();
  }

  var inputs = Array.prototype.slice.call(document.querySelectorAll('.site-search'));
  var filters = Array.prototype.slice.call(document.querySelectorAll('.site-filter'));
  var items = Array.prototype.slice.call(document.querySelectorAll('.filter-list .movie-card, .filter-list .rank-row, .movie-grid .movie-card'));
  var empty = document.querySelector('.empty-state');

  function getValue(nodes) {
    if (!nodes.length) {
      return '';
    }
    return (nodes[0].value || '').trim().toLowerCase();
  }

  function filterItems() {
    var keyword = getValue(inputs);
    var category = getValue(filters);
    var visible = 0;

    items.forEach(function (item) {
      var title = (item.getAttribute('data-title') || '').toLowerCase();
      var meta = (item.getAttribute('data-meta') || '').toLowerCase();
      var year = (item.getAttribute('data-year') || '').toLowerCase();
      var itemCategory = (item.getAttribute('data-category') || '').toLowerCase();
      var matchesText = !keyword || title.indexOf(keyword) !== -1 || meta.indexOf(keyword) !== -1 || year.indexOf(keyword) !== -1;
      var matchesCategory = !category || itemCategory === category;
      var showItem = matchesText && matchesCategory;
      item.classList.toggle('is-filter-hidden', !showItem);
      if (showItem) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0 && items.length > 0);
    }
  }

  inputs.forEach(function (input) {
    input.addEventListener('input', filterItems);
  });

  filters.forEach(function (select) {
    select.addEventListener('change', filterItems);
  });
})();
