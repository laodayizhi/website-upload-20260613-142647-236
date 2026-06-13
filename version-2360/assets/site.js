(function () {
  const navButton = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-main-nav]');

  if (navButton && nav) {
    navButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dots] button'));
    let current = 0;

    const showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  const searchPage = document.querySelector('[data-search-page]');

  if (searchPage) {
    const params = new URLSearchParams(window.location.search);
    const input = searchPage.querySelector('[data-search-input]');
    const status = searchPage.querySelector('[data-search-status]');
    const cards = Array.from(searchPage.querySelectorAll('[data-search-card]'));
    const initial = params.get('q') || '';

    const filterCards = function () {
      const keyword = (input.value || '').trim().toLowerCase();
      let visible = 0;

      cards.forEach(function (card) {
        const text = (card.getAttribute('data-search-text') || '').toLowerCase();
        const matched = keyword === '' || text.indexOf(keyword) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = keyword === '' ? '输入关键词后会显示匹配结果' : '已匹配 ' + visible + ' 条结果';
      }
    };

    if (input) {
      input.value = initial;
      input.addEventListener('input', filterCards);
      filterCards();
    }
  }
})();
