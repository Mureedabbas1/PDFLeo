/* PDFLeo premium UI layer — vanilla JS, no dependencies.
   Handles: theme, navigation, tool search/filter, search overlay, scroll reveal,
   card tilt, hero effects, counters and small interaction feedback.
   It never touches the PDF/document processing code in index.html. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var fine = !!(window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches);
  var automated = !!navigator.webdriver; // keep automated tests deterministic
  if (automated) root.classList.add('no-anim');

  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  function raf(fn) { return window.requestAnimationFrame(fn); }
  function on(el, ev, fn, opt) { if (el) el.addEventListener(ev, fn, opt); }
  function icon(id, cls) { return '<svg class="ic' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#' + id + '"/></svg>'; }

  /* ---------------------------------------------------------------- Theme */
  var KEY = 'pdfleo-theme-v1';
  function readTheme() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function writeTheme(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function currentTheme() { return root.getAttribute('data-pdfleo-theme') === 'light' ? 'light' : 'dark'; }
  var themeBtn = $('#pdfleoThemeToggle');
  function paintTheme() {
    var light = currentTheme() === 'light';
    if (themeBtn) {
      var lbl = $('.tl', themeBtn);
      if (lbl) lbl.textContent = light ? 'Dark' : 'Light';
      themeBtn.setAttribute('aria-pressed', String(light));
      themeBtn.setAttribute('title', light ? 'Switch to dark theme' : 'Switch to light theme');
    }
    var m = $('meta[name="theme-color"]');
    if (m) m.setAttribute('content', light ? '#F3F6FD' : '#080B16');
  }
  function setTheme(next) {
    var apply = function () { root.setAttribute('data-pdfleo-theme', next); writeTheme(next); paintTheme(); };
    if (d.startViewTransition && !reduce && !automated) d.startViewTransition(apply); else apply();
  }
  on(themeBtn, 'click', function () { setTheme(currentTheme() === 'light' ? 'dark' : 'light'); });
  if (!root.getAttribute('data-pdfleo-theme')) root.setAttribute('data-pdfleo-theme', readTheme() === 'light' ? 'light' : 'dark');
  paintTheme();

  /* ----------------------------------------------------------- Navigation */
  var header = $('.pl-header');
  var burger = $('#plBurger'), mobileMenu = $('#plMobileMenu');
  function closeMenu() {
    if (!burger || !mobileMenu || mobileMenu.hidden) return;
    mobileMenu.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
  }
  on(burger, 'click', function () {
    var open = mobileMenu.hidden;
    mobileMenu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  $$('a', mobileMenu).forEach(function (a) { on(a, 'click', closeMenu); });
  $$('[data-proxy]').forEach(function (b) {
    on(b, 'click', function () { closeMenu(); var t = d.getElementById(b.getAttribute('data-proxy')); if (t) t.click(); });
  });
  on(d, 'keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  on(d, 'click', function (e) { if (mobileMenu && !mobileMenu.hidden && header && !header.contains(e.target)) closeMenu(); });

  var navLinks = $$('.pl-links a[href^="#"]');
  var sectionIds = ['top', 'categories', 'tools'];
  var ticking = false;
  var progress = $('#plProgress');
  function onScroll() {
    if (ticking) return; ticking = true;
    raf(function () {
      ticking = false;
      var y = window.scrollY || root.scrollTop;
      if (header) header.classList.toggle('scrolled', y > 8);
      if (progress) {
        var max = Math.max(1, root.scrollHeight - innerHeight);
        progress.style.transform = 'scaleX(' + Math.min(1, y / max).toFixed(4) + ')';
      }
      var active = 'top';
      sectionIds.forEach(function (id) {
        var el = d.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 150) active = id;
      });
      var tools = d.getElementById('tools');
      if (tools && tools.getBoundingClientRect().bottom < 150) active = 'none';
      navLinks.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + active); });
    });
  }
  on(window, 'scroll', onScroll, { passive: true });
  on(window, 'resize', onScroll);
  onScroll();

  /* ---------------------------------------------------------- Scroll reveal */
  var rv = $$('.rv');
  function stagger() {
    $$('[data-stagger]').forEach(function (group) {
      var kids = $$('.rv', group), cols = 1;
      try { cols = getComputedStyle(group).gridTemplateColumns.split(' ').length || 1; } catch (e) {}
      kids.forEach(function (k, i) { k.style.setProperty('--d', String(cols > 1 ? i % cols : Math.min(i, 6))); });
    });
  }
  stagger();
  if (!('IntersectionObserver' in window) || reduce || automated) {
    rv.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------ Hero effects */
  var hero = $('.hero');
  var stage = $('#plStage');
  if (hero && stage && fine && !reduce && !automated) {
    var hx = 0, hy = 0, pend = false;
    on(hero, 'pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      hx = ((e.clientX - r.left) / r.width) * 2 - 1;
      hy = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (pend) return; pend = true;
      raf(function () {
        pend = false;
        hero.style.setProperty('--mx', hx.toFixed(3));
        hero.style.setProperty('--my', hy.toFixed(3));
        stage.style.setProperty('--ry', (hx * 9).toFixed(2) + 'deg');
        stage.style.setProperty('--rx', (-hy * 7).toFixed(2) + 'deg');
      });
    });
    on(hero, 'pointerleave', function () {
      hero.style.setProperty('--mx', 0); hero.style.setProperty('--my', 0);
      stage.style.setProperty('--ry', '0deg'); stage.style.setProperty('--rx', '0deg');
    });
  }
  // Live status label stays in sync with the CSS progress animation.
  var statusTrack = $('#plStatusTrack i'), statusLabel = $('#plStatusLabel'), statusSmall = $('#plStatusSmall');
  var jobs = [['Merging pages', 'merge'], ['Converting to PDF', 'convert'], ['Compressing file', 'compress'], ['Protecting with a password', 'protect'], ['Recognising text (OCR)', 'ocr'], ['Rotating pages', 'rotate']];
  if (statusTrack && statusLabel && !reduce) {
    var ji = 0;
    on(statusTrack, 'animationiteration', function () {
      ji = (ji + 1) % jobs.length;
      statusLabel.textContent = jobs[ji][0];
      if (statusSmall) statusSmall.textContent = 'PDFLeo · ' + jobs[ji][1];
    });
  }

  // Lightweight particle field (paused off-screen / hidden / reduced motion)
  (function particles() {
    var c = $('#plParticles');
    if (!c || reduce || automated || !c.getContext) return;
    var ctx = c.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2), w = 0, h = 0, pts = [], running = false, visible = true;
    var colors = ['100,140,255', '155,123,255', '216,188,131'];
    function size() {
      w = c.clientWidth; h = c.clientHeight;
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = w < 700 ? 20 : 44;
      pts = [];
      for (var i = 0; i < n; i++) pts.push({
        x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22,
        r: Math.random() * 1.6 + .6, c: colors[i % 3], a: Math.random() * .45 + .25
      });
    }
    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      var light = currentTheme() === 'light', k = light ? .7 : 1;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fillStyle = 'rgba(' + p.c + ',' + (p.a * k).toFixed(2) + ')'; ctx.fill();
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], dx = p.x - q.x, dy = p.y - q.y, dist = dx * dx + dy * dy;
          if (dist < 12100) {
            ctx.strokeStyle = 'rgba(' + p.c + ',' + ((1 - dist / 12100) * .16 * k).toFixed(3) + ')';
            ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }
      raf(frame);
    }
    function sync() {
      var should = visible && !d.hidden;
      if (should && !running) { running = true; raf(frame); } else if (!should) running = false;
    }
    size();
    on(window, 'resize', function () { size(); });
    on(d, 'visibilitychange', sync);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; sync(); }).observe(hero || c);
    }
    sync();
  })();

  /* ------------------------------------------------------------ Tool model */
  var grid = $('#toolGrid');
  var cards = $$('.tool[data-category]', grid);
  var heads = $$('.cat-head', grid);
  var emptyBox = $('#toolsEmpty');
  var searchInput = $('#toolSearch');
  var chips = $$('.filter[data-filter]');
  var activeFilter = 'All';
  var model = cards.map(function (el) {
    var btn = $('[data-tool]', el);
    return {
      el: el, key: btn ? btn.getAttribute('data-tool') : '', cat: el.getAttribute('data-category'),
      title: ($('h3', el) || {}).textContent || '', desc: ($('p', el) || {}).textContent || '',
      status: (($('.tool-status', el) || {}).textContent || '').trim(), iconId: el.getAttribute('data-icon') || 'i-file',
      hay: (el.getAttribute('data-title') + ' ' + el.textContent).toLowerCase().replace(/\s+/g, ' ')
    };
  });
  var catMeta = {};
  $$('.cat-tile[data-cat]').forEach(function (t) { catMeta[t.getAttribute('data-cat')] = { icon: t.getAttribute('data-icon') }; });

  function applyFilters() {
    var q = (searchInput && searchInput.value || '').toLowerCase().trim();
    var terms = q ? q.split(/\s+/) : [];
    var shown = 0, perCat = {};
    model.forEach(function (m) {
      var okCat = activeFilter === 'All' || m.cat === activeFilter;
      var okQ = terms.every(function (t) { return m.hay.indexOf(t) > -1; });
      var vis = okCat && okQ;
      m.el.classList.toggle('is-hidden', !vis);
      if (vis) { shown++; perCat[m.cat] = (perCat[m.cat] || 0) + 1; }
    });
    heads.forEach(function (h) {
      var n = perCat[h.getAttribute('data-cat')] || 0;
      h.classList.toggle('is-hidden', n === 0);
      var badge = $('.n', h); if (badge) badge.textContent = n + (n === 1 ? ' tool' : ' tools');
    });
    if (emptyBox) emptyBox.classList.toggle('show', shown === 0);
    var live = $('#toolsLive');
    if (live) live.textContent = shown + (shown === 1 ? ' tool shown' : ' tools shown');
  }
  function setFilter(cat, opts) {
    activeFilter = cat || 'All';
    chips.forEach(function (c) {
      var on_ = c.getAttribute('data-filter') === activeFilter;
      c.classList.toggle('active', on_); c.setAttribute('aria-pressed', String(on_));
    });
    applyFilters();
    if (opts && opts.scroll) scrollToTools();
  }
  function scrollToTools() {
    var t = d.getElementById('tools');
    if (!t) return;
    var tb = $('.pl-toolbar');
    var top = t.getBoundingClientRect().top + window.scrollY - 88;
    if (tb && tb.getBoundingClientRect().top <= 100) top = grid.getBoundingClientRect().top + window.scrollY - (tb.offsetHeight + 110);
    window.scrollTo({ top: Math.max(0, top), behavior: reduce || automated ? 'auto' : 'smooth' });
  }
  chips.forEach(function (c) {
    on(c, 'click', function () {
      var wasStuck = $('.pl-toolbar') && $('.pl-toolbar').getBoundingClientRect().top <= 100;
      setFilter(c.getAttribute('data-filter'));
      if (wasStuck) scrollToTools();
    });
  });
  on(searchInput, 'input', applyFilters);
  on(searchInput, 'keydown', function (e) { if (e.key === 'Escape' && searchInput.value) { searchInput.value = ''; applyFilters(); } });
  $$('[data-cat-target]').forEach(function (t) {
    on(t, 'click', function () { setFilter(t.getAttribute('data-cat-target')); scrollToTools(); });
  });
  on($('#toolsReset'), 'click', function () { if (searchInput) searchInput.value = ''; setFilter('All'); if (searchInput) searchInput.focus(); });
  setFilter('All');

  /* ------------------------------------------------- Card tilt + light glow */
  if (grid && fine && !reduce && !automated) {
    var active = null, tx = 0, ty = 0, queued = false;
    function paintCard() {
      queued = false;
      if (!active) return;
      var r = active.getBoundingClientRect();
      var x = (tx - r.left) / r.width, y = (ty - r.top) / r.height;
      active.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      active.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      active.style.setProperty('--ry', ((x - .5) * 9).toFixed(2) + 'deg');
      active.style.setProperty('--rx', ((.5 - y) * 9).toFixed(2) + 'deg');
    }
    function release(el) {
      if (!el) return;
      el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg');
    }
    on(grid, 'pointermove', function (e) {
      var c = e.target.closest && e.target.closest('.tool');
      if (c !== active) { release(active); active = c; }
      if (!c) return;
      tx = e.clientX; ty = e.clientY;
      if (!queued) { queued = true; raf(paintCard); }
    });
    on(grid, 'pointerleave', function () { release(active); active = null; });
  }

  /* ------------------------------------------------------- Search overlay */
  var overlay = $('#plSearch'), sInput = $('#plSearchInput'), sList = $('#plResults'), sCats = $('#plSearchCats');
  var sFilter = 'All', sIndex = 0, sItems = [], opener = null;
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function score(m, terms) {
    var t = m.title.toLowerCase(), s = 0;
    for (var i = 0; i < terms.length; i++) {
      var term = terms[i];
      if (t.indexOf(term) === 0) s += 6; else if (t.indexOf(term) > -1) s += 4;
      else if (m.hay.indexOf(term) > -1) s += 1.5; else return -1;
    }
    return s;
  }
  function renderResults() {
    var q = (sInput.value || '').toLowerCase().trim(), terms = q ? q.split(/\s+/) : [];
    var list = model.map(function (m) { return { m: m, s: terms.length ? score(m, terms) : 0 }; })
      .filter(function (x) { return x.s >= 0 && (sFilter === 'All' || x.m.cat === sFilter); });
    if (terms.length) list.sort(function (a, b) { return b.s - a.s; });
    sItems = list.map(function (x) { return x.m; });
    if (sIndex >= sItems.length) sIndex = 0;
    if (!sItems.length) {
      sList.innerHTML = '<li class="pl-empty">No tools match “' + esc(q) + '”. Try “merge”, “compress” or “word”.</li>';
      sInput.removeAttribute('aria-activedescendant'); return;
    }
    sList.innerHTML = sItems.map(function (m, i) {
      return '<li role="presentation"><button type="button" role="option" id="plr' + i + '" data-i="' + i + '" aria-selected="' + (i === sIndex) + '" data-category="' + esc(m.cat) + '">' +
        '<span class="ico">' + icon(m.iconId) + '</span><span class="tx"><b>' + esc(m.title) + '</b><small>' + esc(m.desc) + '</small></span><span class="cat">' + esc(m.cat.replace('PDF ', '')) + '</span></button></li>';
    }).join('');
    sInput.setAttribute('aria-activedescendant', 'plr' + sIndex);
  }
  function select(i, scroll) {
    if (!sItems.length) return;
    sIndex = (i + sItems.length) % sItems.length;
    $$('button[role="option"]', sList).forEach(function (b, n) { b.setAttribute('aria-selected', String(n === sIndex)); });
    var cur = $('#plr' + sIndex); sInput.setAttribute('aria-activedescendant', 'plr' + sIndex);
    if (cur && scroll !== false) cur.scrollIntoView({ block: 'nearest' });
  }
  function openSearch(from) {
    if (!overlay) return;
    opener = from || d.activeElement;
    closeMenu();
    overlay.classList.add('open'); overlay.removeAttribute('aria-hidden');
    root.classList.add('lock');
    sInput.value = ''; sFilter = 'All'; sIndex = 0;
    $$('button', sCats).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-sf') === 'All'); });
    renderResults();
    setTimeout(function () { sInput.focus(); }, 30);
  }
  function closeSearch() {
    if (!overlay || !overlay.classList.contains('open')) return;
    overlay.classList.remove('open'); overlay.setAttribute('aria-hidden', 'true');
    root.classList.remove('lock');
    if (opener && opener.focus) { try { opener.focus(); } catch (e) {} }
  }
  function choose(m) {
    if (!m) return;
    closeSearch();
    if (searchInput) searchInput.value = '';
    setFilter('All');
    var btn = $('[data-tool]', m.el);
    if (btn) btn.click(); // uses the page's existing handler to open the real tool
    m.el.classList.add('flash');
    setTimeout(function () { m.el.classList.remove('flash'); }, 2200);
  }
  if (overlay) {
    $$('[data-search-open]').forEach(function (b) { on(b, 'click', function () { openSearch(b); }); });
    on(sInput, 'input', function () { sIndex = 0; renderResults(); });
    on(sList, 'click', function (e) { var b = e.target.closest('button[data-i]'); if (b) choose(sItems[+b.getAttribute('data-i')]); });
    on(sList, 'mousemove', function (e) { var b = e.target.closest('button[data-i]'); if (b && +b.getAttribute('data-i') !== sIndex) select(+b.getAttribute('data-i'), false); });
    on(sCats, 'click', function (e) {
      var b = e.target.closest('button[data-sf]'); if (!b) return;
      sFilter = b.getAttribute('data-sf'); sIndex = 0;
      $$('button', sCats).forEach(function (x) { x.classList.toggle('on', x === b); });
      renderResults(); sInput.focus();
    });
    on($('#plSearchClose'), 'click', closeSearch);
    on(overlay, 'mousedown', function (e) { if (e.target === overlay) closeSearch(); });
    on(overlay, 'keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); select(sIndex + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); select(sIndex - 1); }
      else if (e.key === 'Enter') { if (e.target.closest && e.target.closest('#plSearchCats')) return; e.preventDefault(); choose(sItems[sIndex]); }
      else if (e.key === 'Home' && e.target === sInput && !sInput.value) { select(0); }
      else if (e.key === 'Tab') {
        var f = $$('button,input', overlay).filter(function (x) { return x.offsetParent !== null && x.getAttribute('role') !== 'option'; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }
  on(d, 'keydown', function (e) {
    var tag = (e.target && e.target.tagName || '').toLowerCase();
    var typing = tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target && e.target.isContentEditable);
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); overlay && (overlay.classList.contains('open') ? closeSearch() : openSearch(d.activeElement)); }
    else if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey && overlay && !overlay.classList.contains('open')) {
      var am = $('#authModal'); if (am && am.classList.contains('show')) return;
      e.preventDefault(); openSearch(d.activeElement);
    } else if (e.key === 'Escape') closeSearch();
  });

  /* ------------------------------------------------------ Counters + extras */
  $$('[data-count]').forEach(function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0, suffix = el.getAttribute('data-suffix') || '';
    function setVal(v) { el.textContent = Math.round(v) + suffix; }
    if (reduce || automated || !('IntersectionObserver' in window)) { setVal(target); return; }
    setVal(0);
    var o = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return; o.disconnect();
      var t0 = null, dur = 1300;
      (function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        setVal(target * e);
        if (p < 1) raf(step);
      })(performance.now());
    }, { threshold: .4 });
    o.observe(el);
  });

  // Ripple feedback on primary buttons
  on(d, 'pointerdown', function (e) {
    var b = e.target.closest && e.target.closest('.btn, .rating-submit');
    if (!b || b.disabled || reduce) return;
    var r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2;
    var sp = d.createElement('span'); sp.className = 'ripple';
    sp.style.cssText = 'width:' + s + 'px;height:' + s + 'px;left:' + (e.clientX - r.left - s / 2) + 'px;top:' + (e.clientY - r.top - s / 2) + 'px';
    b.appendChild(sp); setTimeout(function () { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 700);
  });

  // FAQ: keep one answer open at a time
  var faqs = $$('.faq details');
  faqs.forEach(function (dt) {
    on(dt, 'toggle', function () { if (dt.open) faqs.forEach(function (o) { if (o !== dt) o.open = false; }); });
  });

  // Drag & drop onto the tool's drop zone (assigns files to the existing file input)
  var drop = $('.drop'), fileInput = $('#files');
  if (drop && fileInput) {
    ['dragenter', 'dragover'].forEach(function (ev) { on(drop, ev, function (e) { e.preventDefault(); drop.classList.add('drag'); }); });
    ['dragleave', 'dragend'].forEach(function (ev) { on(drop, ev, function () { drop.classList.remove('drag'); }); });
    on(drop, 'drop', function (e) {
      e.preventDefault(); drop.classList.remove('drag');
      var fl = e.dataTransfer && e.dataTransfer.files;
      if (!fl || !fl.length) return;
      try {
        var dt = new DataTransfer();
        var n = fileInput.multiple ? fl.length : 1;
        for (var i = 0; i < n; i++) dt.items.add(fl[i]);
        fileInput.files = dt.files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      } catch (err) { /* browser without DataTransfer constructor: native picker still works */ }
    });
  }
})();
