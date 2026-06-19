/* =========================================================
   EmpowerHer — main.js
   Shared interactive behaviour across all pages
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Scroll reveal animations ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Accordion (Educational FAQ) ---------- */
  document.querySelectorAll('.accordion-item').forEach(function (item) {
    var head = item.querySelector('.accordion-head');
    var body = item.querySelector('.accordion-body');
    if (!head || !body) return;
    head.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      // close siblings within the same accordion group
      var group = item.closest('.accordion');
      if (group) {
        group.querySelectorAll('.accordion-item.open').forEach(function (sib) {
          if (sib !== item) {
            sib.classList.remove('open');
            sib.querySelector('.accordion-body').style.maxHeight = null;
            sib.querySelector('.accordion-head').setAttribute('aria-expanded', 'false');
          }
        });
      }
      item.classList.toggle('open', !isOpen);
      head.setAttribute('aria-expanded', (!isOpen).toString());
      body.style.maxHeight = !isOpen ? body.scrollHeight + 'px' : null;
    });
  });

  /* ---------- Tabs (Products / Education resources) ---------- */
  document.querySelectorAll('.tabs').forEach(function (tabGroup) {
    var targetSelector = tabGroup.getAttribute('data-tabs-target');
    if (!targetSelector) return;
    var panels = document.querySelectorAll(targetSelector + ' [data-tab-panel]');
    tabGroup.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        tabGroup.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var key = btn.getAttribute('data-tab');
        panels.forEach(function (panel) {
          panel.hidden = panel.getAttribute('data-tab-panel') !== key && key !== 'all';
        });
      });
    });
  });

  /* ---------- Gallery filter + lightbox ---------- */
  var galleryGrid = document.querySelector('[data-gallery]');
  if (galleryGrid) {
    var items = Array.prototype.slice.call(galleryGrid.querySelectorAll('.gallery-item'));
    var filterBtns = document.querySelectorAll('[data-gallery-filter]');

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        var filter = btn.getAttribute('data-gallery-filter');
        items.forEach(function (item) {
          var matches = filter === 'all' || item.getAttribute('data-category') === filter;
          item.hidden = !matches;
        });
      });
    });

    var lightbox = document.querySelector('.lightbox');
    if (lightbox) {
      var lbImg = lightbox.querySelector('img');
      var lbCaption = lightbox.querySelector('.lightbox-caption');
      var currentIndex = 0;

      function visibleItems() {
        return items.filter(function (i) { return !i.hidden; });
      }
      function openLightbox(index) {
        var vis = visibleItems();
        currentIndex = (index + vis.length) % vis.length;
        var el = vis[currentIndex];
        var img = el.querySelector('img');
        lbImg.src = img.src;
        lbImg.alt = img.alt;
        lbCaption.textContent = el.getAttribute('data-caption') || img.alt;
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
      }
      function closeLightbox() {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
      }

      items.forEach(function (item, idx) {
        item.addEventListener('click', function () { openLightbox(visibleItems().indexOf(item)); });
        item.setAttribute('tabindex', '0');
        item.addEventListener('keypress', function (e) {
          if (e.key === 'Enter') openLightbox(visibleItems().indexOf(item));
        });
      });

      lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
      lightbox.querySelector('.lightbox-prev').addEventListener('click', function () { openLightbox(currentIndex - 1); });
      lightbox.querySelector('.lightbox-next').addEventListener('click', function () { openLightbox(currentIndex + 1); });
      lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
      document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') openLightbox(currentIndex + 1);
        if (e.key === 'ArrowLeft') openLightbox(currentIndex - 1);
      });
    }
  }

  /* ---------- Product search / filter / sort ---------- */
  var productGrid = document.querySelector('[data-product-grid]');
  if (productGrid) {
    var productCards = Array.prototype.slice.call(productGrid.querySelectorAll('.product-card'));
    var searchInput = document.querySelector('[data-product-search]');
    var categoryBtns = document.querySelectorAll('[data-product-filter]');
    var sortSelect = document.querySelector('[data-product-sort]');
    var emptyState = document.querySelector('[data-product-empty]');
    var activeCategory = 'all';

    function applyProducts() {
      var query = (searchInput && searchInput.value || '').trim().toLowerCase();
      var visibleCount = 0;
      productCards.forEach(function (card) {
        var name = card.getAttribute('data-name').toLowerCase();
        var category = card.getAttribute('data-category');
        var matchesQuery = !query || name.includes(query);
        var matchesCategory = activeCategory === 'all' || category === activeCategory;
        var show = matchesQuery && matchesCategory;
        card.hidden = !show;
        if (show) visibleCount++;
      });
      if (emptyState) emptyState.hidden = visibleCount !== 0;
    }

    function applySort() {
      if (!sortSelect) return;
      var value = sortSelect.value;
      var sorted = productCards.slice().sort(function (a, b) {
        if (value === 'name-asc') return a.getAttribute('data-name').localeCompare(b.getAttribute('data-name'));
        if (value === 'name-desc') return b.getAttribute('data-name').localeCompare(a.getAttribute('data-name'));
        return 0;
      });
      sorted.forEach(function (card) { productGrid.appendChild(card); });
    }

    if (searchInput) searchInput.addEventListener('input', applyProducts);
    categoryBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        categoryBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-product-filter');
        applyProducts();
      });
    });
    if (sortSelect) sortSelect.addEventListener('change', applySort);
    applyProducts();
  }

  /* ---------- Educational resource search ---------- */
  var resourceList = document.querySelector('[data-resource-list]');
  if (resourceList) {
    var resourceCards = Array.prototype.slice.call(resourceList.querySelectorAll('[data-resource-name]'));
    var resourceSearch = document.querySelector('[data-resource-search]');
    var resourceEmpty = document.querySelector('[data-resource-empty]');
    if (resourceSearch) {
      resourceSearch.addEventListener('input', function () {
        var query = resourceSearch.value.trim().toLowerCase();
        var count = 0;
        resourceCards.forEach(function (card) {
          var show = !query || card.getAttribute('data-resource-name').toLowerCase().includes(query);
          card.hidden = !show;
          if (show) count++;
        });
        if (resourceEmpty) resourceEmpty.hidden = count !== 0;
      });
    }
  }

  /* ---------- Donation calculator ---------- */
  var donateForm = document.querySelector('[data-donate-calc]');
  if (donateForm) {
    var amountBtns = donateForm.querySelectorAll('.amount-btn');
    var customInput = donateForm.querySelector('[data-donate-custom]');
    var freqBtns = donateForm.querySelectorAll('.toggle-group button');
    var impactEl = donateForm.querySelector('[data-impact-num]');
    var impactText = donateForm.querySelector('[data-impact-text]');
    var frequency = 'once';
    var amount = 250;

    function updateImpact() {
      var packs = Math.max(0, Math.round(amount / 25));
      if (impactEl) impactEl.textContent = packs;
      if (impactText) {
        impactText.textContent = 'hygiene packs ' + (frequency === 'monthly' ? 'every month' : 'delivered') + ' thanks to your R' + amount + (frequency === 'monthly' ? '/month' : '') + ' gift.';
      }
    }

    amountBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        amountBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        amount = parseInt(btn.getAttribute('data-amount'), 10);
        if (customInput) customInput.value = '';
        updateImpact();
      });
    });
    if (customInput) {
      customInput.addEventListener('input', function () {
        var val = parseInt(customInput.value, 10);
        if (!isNaN(val) && val > 0) {
          amountBtns.forEach(function (b) { b.classList.remove('active'); });
          amount = val;
          updateImpact();
        }
      });
    }
    freqBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        freqBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        frequency = btn.getAttribute('data-freq');
        updateImpact();
      });
    });
    updateImpact();
  }

});
