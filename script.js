(function () {
  'use strict';

  const root = document.documentElement;
  root.classList.add('js');

  const themeToggle = document.querySelector('.theme-toggle');
  const menuToggle = document.querySelector('.menu-toggle');
  const header = document.querySelector('.site-header');
  const navLinks = Array.from(document.querySelectorAll('.site-nav a'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const themeMeta = document.querySelector('meta[name="theme-color"]');

  function syncTheme() {
    const isDark = root.dataset.theme === 'dark';
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
    if (themeMeta) {
      themeMeta.setAttribute('content', isDark ? '#071a2e' : '#ffffff');
    }
  }

  if (themeToggle) {
    syncTheme();
    themeToggle.addEventListener('click', function () {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try {
        localStorage.setItem('theme', next);
      } catch (error) {
        /* Storage can be unavailable in private browsing. */
      }
      syncTheme();
    });
  }

  function closeMenu() {
    header.classList.remove('nav-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMenu();
        return;
      }
      header.classList.add('nav-open');
      menuToggle.setAttribute('aria-expanded', 'true');
      menuToggle.setAttribute('aria-label', 'Close menu');
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeMenu();
      }
    });

    document.addEventListener('click', function (event) {
      if (!header.contains(event.target)) {
        closeMenu();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 820) {
        closeMenu();
      }
    });
  }

  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    revealElements.forEach(function (element) {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach(function (element) {
      element.classList.add('is-visible');
    });
  }

  const navTargets = navLinks
    .map(function (link) {
      const target = document.querySelector(link.getAttribute('href'));
      return target ? { link: link, section: target } : null;
    })
    .filter(Boolean);

  if (navTargets.length) {
    const hero = document.getElementById('top');
    let navQueued = false;

    function updateActiveNav() {
      navQueued = false;
      const readingLine = window.innerHeight * 0.45;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let current = null;

      if (!atBottom && hero && hero.getBoundingClientRect().bottom > readingLine) {
        current = null;
      } else {
        navTargets.forEach(function (item) {
          if (item.section.getBoundingClientRect().top <= readingLine) {
            current = item.link;
          }
        });
      }

      navLinks.forEach(function (link) {
        link.classList.toggle('is-active', link === current);
      });
    }

    function queueNavUpdate() {
      if (navQueued) {
        return;
      }
      navQueued = true;
      window.requestAnimationFrame(updateActiveNav);
    }

    window.addEventListener('scroll', queueNavUpdate, { passive: true });
    window.addEventListener('resize', queueNavUpdate);
    updateActiveNav();
  }

  const year = document.getElementById('year');
  if (year) {
    year.textContent = new Date().getFullYear();
  }
})();
