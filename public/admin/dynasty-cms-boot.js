/** Re-inject Dynasty theme + simplify toolbar copy + portfolio thumbnails. */
(function () {
  var portfolioIndex = null;
  var portfolioIndexPromise = null;

  function injectTheme() {
    var id = 'dynasty-cms-theme';
    var link = document.getElementById(id);
    if (!link) {
      link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = '/admin/dynasty-cms.css?v=' + Date.now();
  }

  function shortenToolbarLabels(root) {
    root = root || document;

    root.querySelectorAll('[class*="BackCollection"]').forEach(function (el) {
      var full = el.textContent.trim();
      if (el.dataset.dynastyShort === '1') return;
      var match = full.match(/(?:Escribiendo en la\s+)?(?:colección|collection)\s+(.+)/i);
      if (match) {
        el.textContent = match[1].trim();
        el.title = full;
        el.dataset.dynastyShort = '1';
      }
    });

    root.querySelectorAll('[class*="BackStatus"]').forEach(function (el) {
      var t = el.textContent.trim();
      if (t === 'Guardado' || t === 'Sin guardar' || t === 'Guardando…') return;
      if (t === 'Cambios guardados') el.textContent = 'Guardado';
      else if (t === 'Cambios sin guardar') el.textContent = 'Sin guardar';
      else if (/guardando/i.test(t)) el.textContent = 'Guardando…';
    });

    root.querySelectorAll('[class*="DeleteButton"]').forEach(function (el) {
      if (el.dataset.dynastyDelete === '1') return;
      if (/eliminar entrada/i.test(el.textContent)) {
        el.textContent = 'Borrar proyecto';
        el.title = 'Eliminar este proyecto del portafolio';
        el.dataset.dynastyDelete = '1';
      }
    });
  }

  function watchToolbar() {
    var root = document.getElementById('nc-root');
    if (!root || root.dataset.dynastyWatch === '1') return;
    root.dataset.dynastyWatch = '1';
    var timer;
    var run = function () {
      shortenToolbarLabels(root);
    };
    run();
    var observer = new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(run, 60);
    });
    observer.observe(root, { childList: true, subtree: true, characterData: true });
  }

  function loadPortfolioIndex() {
    if (portfolioIndex) return Promise.resolve(portfolioIndex);
    if (portfolioIndexPromise) return portfolioIndexPromise;
    portfolioIndexPromise = fetch('/admin/portfolio-index.json?v=' + Date.now())
      .then(function (res) {
        if (!res.ok) throw new Error('portfolio-index');
        return res.json();
      })
      .then(function (list) {
        var map = {};
        list.forEach(function (item) {
          map[item.slug] = item;
        });
        portfolioIndex = map;
        return map;
      })
      .catch(function () {
        portfolioIndex = {};
        return portfolioIndex;
      });
    return portfolioIndexPromise;
  }

  function slugFromHref(href) {
    if (!href) return null;
    var match = href.match(/\/entries\/([^/?#]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  function initials(title) {
    if (!title) return '?';
    var parts = title.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function ensureThumb(card, item, isGrid) {
    if (card.querySelector('.dynasty-entry-thumb')) return;
    var thumb = document.createElement('div');
    thumb.className = 'dynasty-entry-thumb' + (isGrid ? ' dynasty-entry-thumb--grid' : '');
    if (item && item.cardImage) {
      var img = document.createElement('img');
      img.src = item.cardImage;
      img.alt = item.title || '';
      img.loading = 'lazy';
      thumb.appendChild(img);
    } else if (item && item.video) {
      thumb.classList.add('dynasty-entry-thumb--video');
      thumb.setAttribute('aria-label', 'Video');
      thumb.textContent = '▶';
    } else {
      thumb.classList.add('dynasty-entry-thumb--placeholder');
      thumb.textContent = initials(item && item.title);
    }
    card.insertBefore(thumb, card.firstChild);
    card.classList.add('dynasty-entry-card');
    if (isGrid) card.classList.add('dynasty-entry-card--grid');
  }

  function decoratePortfolioCards(root) {
    if (!root || !location.hash.match(/collections\/portfolio/)) return;
    if (!portfolioIndex) return;

    var links = root.querySelectorAll('a[href*="collections/portfolio/entries/"]');
    links.forEach(function (link) {
      var slug = slugFromHref(link.getAttribute('href'));
      if (!slug) return;
      var item = portfolioIndex[slug];
      var isGrid = /GridCard/i.test(link.className);
      ensureThumb(link, item, isGrid);
    });
  }

  function watchPortfolioThumbs() {
    var root = document.getElementById('nc-root');
    if (!root || root.dataset.dynastyThumbs === '1') return;
    root.dataset.dynastyThumbs = '1';
    var timer;
    var run = function () {
      decoratePortfolioCards(root);
    };
    loadPortfolioIndex().then(function () {
      run();
      var observer = new MutationObserver(function () {
        clearTimeout(timer);
        timer = setTimeout(run, 80);
      });
      observer.observe(root, { childList: true, subtree: true });
      window.addEventListener('hashchange', run);
    });
  }

  injectTheme();
  window.addEventListener('load', function () {
    setTimeout(injectTheme, 50);
    setTimeout(injectTheme, 400);
    setTimeout(watchToolbar, 100);
    setTimeout(watchToolbar, 600);
    setTimeout(watchPortfolioThumbs, 150);
    setTimeout(watchPortfolioThumbs, 700);
  });
})();
