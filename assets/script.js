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
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("in");
    });
  }

  // Footer year
  document.getElementById("year").textContent = new Date().getFullYear();
})();
