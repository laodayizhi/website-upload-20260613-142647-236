(function () {
  const header = document.querySelector('[data-header]');
  const toggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  function updateHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let active = 0;
    let timer = null;

    function setActive(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        setActive(active + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        setActive(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        setActive(active + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setActive(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    setActive(0);
    start();
  }

  const searchInput = document.querySelector('[data-search-input]');
  const cards = Array.from(document.querySelectorAll('[data-card]'));
  const filters = Array.from(document.querySelectorAll('[data-filter]'));
  let activeFilter = '';

  if (searchInput && searchInput.dataset.urlQuery) {
    const params = new URLSearchParams(window.location.search);
    const value = params.get(searchInput.dataset.urlQuery);
    if (value) {
      searchInput.value = value;
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilter() {
    const keyword = normalize(searchInput ? searchInput.value : '');
    cards.forEach(function (card) {
      const haystack = normalize(card.dataset.search);
      const matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      const matchFilter = !activeFilter || haystack.indexOf(activeFilter) !== -1;
      card.classList.toggle('is-hidden', !(matchKeyword && matchFilter));
    });
  }

  if (searchInput && cards.length) {
    searchInput.addEventListener('input', applyFilter);
    applyFilter();
  }

  if (filters.length && cards.length) {
    filters.forEach(function (button) {
      button.addEventListener('click', function () {
        filters.forEach(function (item) {
          item.classList.remove('is-active');
        });
        button.classList.add('is-active');
        activeFilter = normalize(button.dataset.filter);
        applyFilter();
      });
    });
  }
})();
