(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var header = document.querySelector("[data-header]");
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    function syncHeader() {
      if (!header) {
        return;
      }
      header.classList.toggle("is-scrolled", window.scrollY > 20);
    }

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
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

      function advance(step) {
        show(index + step);
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          advance(1);
        }, 5000);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          advance(-1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          advance(1);
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
    });

    document.querySelectorAll(".container").forEach(function (wrap) {
      var input = wrap.querySelector("[data-search-input]");
      var select = wrap.querySelector("[data-sort-select]");
      var collection = wrap.querySelector(".movie-collection");

      if (!collection) {
        return;
      }

      var cards = Array.prototype.slice.call(collection.querySelectorAll(".movie-card"));

      function filterCards() {
        var query = input ? input.value.trim().toLowerCase() : "";
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title") || "",
            card.getAttribute("data-year") || "",
            card.getAttribute("data-tags") || ""
          ].join(" ").toLowerCase();
          card.classList.toggle("is-hidden-by-filter", query && haystack.indexOf(query) === -1);
        });
      }

      function sortCards() {
        if (!select) {
          return;
        }
        var mode = select.value;
        var sorted = cards.slice().sort(function (a, b) {
          if (mode === "year") {
            return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
          }
          if (mode === "title") {
            return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
          }
          return Number(b.getAttribute("data-score") || 0) - Number(a.getAttribute("data-score") || 0);
        });
        sorted.forEach(function (card) {
          collection.appendChild(card);
        });
        cards = sorted;
        filterCards();
      }

      if (input) {
        input.addEventListener("input", filterCards);
      }

      if (select) {
        select.addEventListener("change", sortCards);
      }
    });
  });
})();
