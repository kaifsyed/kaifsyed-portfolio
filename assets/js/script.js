'use strict';

const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');

if (menuToggle && nav) {
  const setMenuOpen = open => {
    nav.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    const icon = menuToggle.querySelector('ion-icon');
    if (icon) icon.name = open ? 'close-outline' : 'menu-outline';
  };

  menuToggle.addEventListener('click', () => setMenuOpen(!nav.classList.contains('open')));
  nav.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;

    setMenuOpen(false);
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && nav.classList.contains('open')) {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  const desktopNavigation = window.matchMedia('(min-width: 641px)');
  desktopNavigation.addEventListener('change', event => {
    if (event.matches) setMenuOpen(false);
  });
}

const navLinks = document.querySelectorAll('.nav-link');

const certificationList = document.getElementById('certificationList');
const certificationToggle = document.getElementById('certificationToggle');
const mobileCertifications = window.matchMedia('(max-width: 640px)');
let certificationsExpanded = false;
let certificationsAreMobile = mobileCertifications.matches;

if (certificationList && certificationToggle) {
  const certificationCards = certificationList.querySelectorAll('.certification-card');

  const collapsedCertificationHeight = () => {
    const thirdCard = certificationCards[2];
    return thirdCard
      ? thirdCard.offsetTop + thirdCard.offsetHeight - certificationList.offsetTop
      : certificationList.scrollHeight;
  };

  const updateCertificationControl = () => {
    certificationToggle.textContent = certificationsExpanded ? 'See Less' : 'See More';
    certificationToggle.setAttribute('aria-expanded', String(certificationsExpanded));
    certificationToggle.setAttribute(
      'aria-label',
      certificationsExpanded ? 'Show fewer certifications' : 'Show all certifications'
    );
  };

  const syncCertificationLayout = (collapse = false) => {
    if (!mobileCertifications.matches) {
      certificationsExpanded = false;
      certificationList.classList.remove('is-collapsible');
      certificationList.style.maxHeight = '';
      certificationToggle.classList.remove('is-visible');
      updateCertificationControl();
      return;
    }

    certificationList.classList.add('is-collapsible');
    certificationToggle.classList.toggle('is-visible', certificationCards.length > 3);
    if (collapse) certificationsExpanded = false;

    if (certificationsExpanded) {
      certificationList.style.maxHeight = 'none';
    } else {
      certificationList.style.maxHeight = `${collapsedCertificationHeight()}px`;
    }
    updateCertificationControl();
  };

  syncCertificationLayout(true);

  certificationToggle.addEventListener('click', () => {
    if (!mobileCertifications.matches || certificationCards.length <= 3) return;

    if (certificationsExpanded) {
      certificationList.style.maxHeight = `${certificationList.getBoundingClientRect().height}px`;
      certificationList.offsetHeight;
      certificationsExpanded = false;
      updateCertificationControl();
      requestAnimationFrame(() => {
        certificationList.style.maxHeight = `${collapsedCertificationHeight()}px`;
      });
    } else {
      certificationsExpanded = true;
      updateCertificationControl();
      certificationList.style.maxHeight = `${certificationList.scrollHeight}px`;
    }
  });

  certificationList.addEventListener('transitionend', event => {
    if (event.propertyName === 'max-height' && certificationsExpanded && mobileCertifications.matches) {
      certificationList.style.maxHeight = 'none';
    }
  });

  window.addEventListener('resize', () => {
    const isMobile = mobileCertifications.matches;
    const crossedBreakpoint = certificationsAreMobile !== isMobile;
    certificationsAreMobile = isMobile;
    syncCertificationLayout(crossedBreakpoint && isMobile);
  });
}

const projectCursorMedia = window.matchMedia('(hover: hover) and (pointer: fine)');
const reducedMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

if (projectCursorMedia.matches && !reducedMotionPreference.matches) {
  document.querySelectorAll('[data-project-cursor]').forEach(card => {
    const cursor = card.querySelector('.project-cursor');
    if (!cursor) return;

    const moveCursor = event => {
      if (event.pointerType !== 'mouse') return;

      const bounds = card.getBoundingClientRect();
      const x = Math.min(Math.max(event.clientX - bounds.left, 80), bounds.width - 80);
      const y = Math.min(Math.max(event.clientY - bounds.top, 18), bounds.height - 18);
      cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    };

    card.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse') return;
      card.classList.add('is-cursor-active');
      moveCursor(event);
    });
    card.addEventListener('pointermove', moveCursor);
    card.addEventListener('pointerleave', () => card.classList.remove('is-cursor-active'));
  });
}

// active nav on scroll
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 120;
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });
  navLinks.forEach(l => {
    l.classList.toggle('active', l.getAttribute('href') === '#' + current);
  });
});

// reveal on scroll
const revealEls = document.querySelectorAll('.project-card, .skill-group, .resume-card, .contact-link-card');
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity .6s ease, transform .6s ease';
  io.observe(el);
});

// reduced motion
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  revealEls.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; el.style.transition = 'none'; });
}
