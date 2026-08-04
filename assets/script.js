(function () {
  // Theme toggle
  var root = document.documentElement;
  var toggle = document.getElementById("themeToggle");
  var iconSun = document.getElementById("iconSun");
  var iconMoon = document.getElementById("iconMoon");

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function applyIcon(theme) {
    var isDark = theme === "dark" || (theme === null && systemPrefersDark());
    iconSun.style.display = isDark ? "none" : "block";
    iconMoon.style.display = isDark ? "block" : "none";
  }

  var stored = localStorage.getItem("theme");
  if (stored) root.setAttribute("data-theme", stored);
  applyIcon(stored);

  toggle.addEventListener("click", function () {
    var current = root.getAttribute("data-theme") || (systemPrefersDark() ? "dark" : "light");
    var next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    applyIcon(next);
  });

  // Mobile nav toggle
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.querySelector(".nav-links");
  navToggle.addEventListener("click", function () {
    var isOpen = navLinks.style.display === "flex";
    navLinks.style.display = isOpen ? "none" : "flex";
    navLinks.style.flexDirection = "column";
    navLinks.style.position = "absolute";
    navLinks.style.top = "56px";
    navLinks.style.right = "24px";
    navLinks.style.background = "var(--surface)";
    navLinks.style.border = "1px solid var(--border)";
    navLinks.style.borderRadius = "12px";
    navLinks.style.padding = "14px 20px";
    navLinks.style.gap = "14px";
    navLinks.style.boxShadow = "var(--shadow-md)";
  });
  navLinks.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () {
      if (window.innerWidth <= 640) navLinks.style.display = "none";
    });
  });

  // Scroll reveal
  //
  // This used to be an IntersectionObserver, which left content permanently
  // invisible. The observer only fires for elements that are on screen during
  // a rendered frame, so anything the viewport skips past never reveals:
  // following an anchor link to #projects, a restored scroll position on
  // back-navigation, or simply flicking down fast. Measured on this page it
  // stranded 16 of 31 elements at opacity 0, five of them sitting on screen.
  //
  // A position sweep has no such gap: on every frame where the page has
  // scrolled, anything whose top has passed the bottom of the viewport is
  // revealed, regardless of how it got there.
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var lastSweep = 0;

  function sweep() {
    lastSweep = Date.now();
    var limit = window.innerHeight - 60; // reveal slightly before the edge
    for (var i = revealEls.length - 1; i >= 0; i--) {
      var el = revealEls[i];
      if (el.getBoundingClientRect().top < limit) {
        el.classList.add("in");
        revealEls.splice(i, 1); // revealed once, never re-checked
      }
    }
  }

  // Throttled with a timestamp rather than requestAnimationFrame: rAF is
  // suspended in background tabs, so a page opened in a new tab and read
  // later could sit with its content still hidden. The sweep is a handful of
  // getBoundingClientRect calls on a list that only shrinks, so running it
  // straight from the scroll handler costs nothing.
  function queueSweep() {
    if (revealEls.length === 0) return;
    if (Date.now() - lastSweep < 80) return;
    sweep();
  }

  sweep();
  window.addEventListener("scroll", queueSweep, { passive: true });
  window.addEventListener("resize", queueSweep);
  window.addEventListener("load", sweep);
  // Safari restores scroll position on back-navigation without firing scroll.
  window.addEventListener("pageshow", sweep);
  // Catch up on anything missed while the tab was in the background.
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) sweep();
  });

  // Footer year
  document.getElementById("year").textContent = new Date().getFullYear();

  // Count up hero stats
  //
  // The animation only ever runs when the page is actually being looked at.
  // It used to start unconditionally on requestAnimationFrame, which is
  // suspended in a background tab — so opening the site in a new tab and
  // switching to it later left the headline stats reading "0+ projects
  // shipped" and "0 degrees" permanently. The real number is the point; the
  // animation is decoration, so it is the part that gets skipped.
  var counters = Array.prototype.slice.call(
    document.querySelectorAll(".hero-meta-item strong")
  );
  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  counters.forEach(function (el) {
    var match = el.textContent.trim().match(/^(\d+)(\+?)$/);
    if (!match) return;
    var target = parseInt(match[1], 10);
    var suffix = match[2];
    var settle = function () {
      el.textContent = target + suffix;
    };

    if (reduceMotion || document.hidden) {
      settle();
      return;
    }

    var duration = 900;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      el.textContent = Math.floor(progress * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else settle();
    }
    requestAnimationFrame(step);
    // Belt and braces: if the frame loop never delivers, show the real number.
    setTimeout(settle, duration + 400);
  });
})();
