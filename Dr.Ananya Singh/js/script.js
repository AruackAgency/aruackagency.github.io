/**
 * Dr. Aryan Mehta Medical Clinic — Main JavaScript
 * script.js | Version 1.0
 *
 * Sections:
 * 01. Loader
 * 02. Dark Mode
 * 03. Navbar (scroll + mobile menu)
 * 04. Smooth Scroll
 * 05. Scroll Progress Bar
 * 06. Scroll Reveal Animations
 * 07. Counter Animation
 * 08. Typing Effect
 * 09. Appointment Form Validation & Modal
 * 10. Testimonial Slider
 * 11. Gallery Lightbox
 * 12. FAQ Accordion
 * 13. Back to Top
 * 14. Button Ripple Effect
 * 15. Contact Quick Form
 * 16. Newsletter Form
 * 17. Page Transitions
 * 18. Active Nav Link on Scroll
 * 19. Lazy Loading
 * 20. Floating Icon Random Movement
 */

'use strict';

/* ─────────────────────────────────────────────────────
   Utilities
───────────────────────────────────────────────────── */

/**
 * Query one element
 * @param {string} sel - CSS selector
 * @param {Element} ctx - Context element (default: document)
 */
const $ = (sel, ctx = document) => ctx.querySelector(sel);

/**
 * Query all elements
 * @param {string} sel - CSS selector
 * @param {Element} ctx - Context element
 */
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/**
 * Add event listener shorthand
 */
const on = (el, event, fn, opts) => el && el.addEventListener(event, fn, opts);

/**
 * Debounce function
 */
const debounce = (fn, ms = 150) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};

/* ─────────────────────────────────────────────────────
   01. Loader
───────────────────────────────────────────────────── */
const initLoader = () => {
  const loader = $('#loader');
  if (!loader) return;

  const hide = () => {
    loader.classList.add('hidden');
    document.body.classList.add('loaded');
    // Trigger entrance animations after loader hides
    setTimeout(triggerHeroAnimations, 200);
  };

  // Hide after page load (max 2.5s)
  if (document.readyState === 'complete') {
    setTimeout(hide, 600);
  } else {
    window.addEventListener('load', () => setTimeout(hide, 600));
    setTimeout(hide, 2500); // Failsafe
  }
};

const triggerHeroAnimations = () => {
  const heroEls = $$('[data-animate]', $('.hero'));
  heroEls.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('animated');
    }, i * 200);
  });
};

/* ─────────────────────────────────────────────────────
   02. Dark Mode
───────────────────────────────────────────────────── */
const initDarkMode = () => {
  const toggle = $('#darkToggle');
  const html = document.documentElement;
  const storageKey = 'clinic-theme';

  // Check saved preference or system preference
  const savedTheme = localStorage.getItem(storageKey);
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = savedTheme || (systemDark ? 'dark' : 'light');
  html.setAttribute('data-theme', initial);

  if (!toggle) return;

  on(toggle, 'click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem(storageKey, next);

    // Announce to screen readers
    toggle.setAttribute('aria-label', `Switch to ${current} mode`);
  });

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(storageKey)) {
      html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });
};

/* ─────────────────────────────────────────────────────
   03. Navbar — Scroll shrink + Mobile menu
───────────────────────────────────────────────────── */
const initNavbar = () => {
  const header = $('#header');
  const hamburger = $('#hamburger');
  const navLinks = $('#navLinks');
  if (!header) return;

  // Create mobile overlay
  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);

  // Scroll handler: shrink navbar
  const onScroll = () => {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Initial check

  // Mobile menu toggle
  const openMenu = () => {
    navLinks.classList.add('open');
    overlay.classList.add('active');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    navLinks.classList.remove('open');
    overlay.classList.remove('active');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  on(hamburger, 'click', () => {
    const isOpen = navLinks.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  on(overlay, 'click', closeMenu);

  // Close menu on nav link click
  $$('.nav-link').forEach(link => {
    on(link, 'click', closeMenu);
  });

  // Close on Escape key
  on(document, 'keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      closeMenu();
      hamburger.focus();
    }
  });
};

/* ─────────────────────────────────────────────────────
   04. Smooth Scroll (Polyfill for older browsers)
───────────────────────────────────────────────────── */
const initSmoothScroll = () => {
  $$('a[href^="#"]').forEach(link => {
    on(link, 'click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();

      const headerHeight = $('#header')?.offsetHeight || 80;
      const targetY = target.getBoundingClientRect().top + window.scrollY - headerHeight;

      window.scrollTo({ top: targetY, behavior: 'smooth' });

      // Auto-select department if data-dept exists on the link
      if (link.dataset.dept) {
        const deptSelect = $('#department');
        if (deptSelect) {
          deptSelect.value = link.dataset.dept;
          deptSelect.classList.remove('error');
          deptSelect.classList.add('success');
        }
      }
    });
  });
};

/* ─────────────────────────────────────────────────────
   05. Scroll Progress Bar
───────────────────────────────────────────────────── */
const initScrollProgress = () => {
  const bar = $('#scrollProgress');
  if (!bar) return;

  const update = () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? Math.round((scrolled / total) * 100) : 0;
    bar.style.width = `${pct}%`;
    bar.setAttribute('aria-valuenow', pct);
  };

  window.addEventListener('scroll', update, { passive: true });
};

/* ─────────────────────────────────────────────────────
   06. Scroll Reveal Animations (IntersectionObserver)
───────────────────────────────────────────────────── */
const initScrollReveal = () => {
  // Skip hero elements (handled separately after loader)
  const elements = $$('[data-animate]').filter(el => !el.closest('.hero'));
  if (!elements.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || 0, 10);

        setTimeout(() => {
          el.classList.add('animated');
        }, delay);

        observer.unobserve(el); // Animate once
      }
    });
  }, observerOptions);

  elements.forEach(el => observer.observe(el));
};

/* ─────────────────────────────────────────────────────
   07. Counter Animation
───────────────────────────────────────────────────── */
const initCounters = () => {
  const counters = $$('[data-count]');
  if (!counters.length) return;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const animateCounter = (el, target, duration = 2000) => {
    const start = performance.now();

    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      const current = Math.round(eased * target);

      el.textContent = current.toLocaleString('en-IN');

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString('en-IN');
      }
    };

    requestAnimationFrame(update);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        animateCounter(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
};

/* ─────────────────────────────────────────────────────
   08. Typing Effect
───────────────────────────────────────────────────── */
const initTypingEffect = () => {
  const el = $('#typingText');
  if (!el) return;

  const phrases = [
    'Ayurvedic Medicine',
    'Panchakarma Therapy',
    'Women\'s Health',
    'Child Healthcare',
    'Diabetes Management',
    'Herbal Treatment',
    'Preventive Care',
    'Holistic Wellness',
  ];

  let phraseIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let pause = false;

  const type = () => {
    const current = phrases[phraseIdx];
    const displayed = isDeleting
      ? current.substring(0, charIdx - 1)
      : current.substring(0, charIdx + 1);

    el.textContent = displayed;
    el.setAttribute('aria-label', displayed);

    if (!isDeleting) {
      charIdx++;
      if (charIdx > current.length) {
        // Pause at end of word
        pause = true;
        setTimeout(() => {
          pause = false;
          isDeleting = true;
          type();
        }, 1800);
        return;
      }
    } else {
      charIdx--;
      if (charIdx < 0) {
        isDeleting = false;
        charIdx = 0;
        phraseIdx = (phraseIdx + 1) % phrases.length;
      }
    }

    if (!pause) {
      const speed = isDeleting ? 55 : 95;
      setTimeout(type, speed);
    }
  };

  // Start after a short delay
  setTimeout(type, 1200);
};

/* ─────────────────────────────────────────────────────
   09. Appointment Form Validation & Modal
───────────────────────────────────────────────────── */
const initAppointmentForm = () => {
  const form = $('#appointmentForm');
  const modal = $('#apptModal');
  const modalClose = $('#modalClose');
  const modalPatientName = $('#modalPatientName');
  const modalDetails = $('#modalDetails');
  if (!form) return;

  // Set minimum date to today
  const dateInput = $('#appointmentDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  // Validation rules
  const validators = {
    patientName: {
      test: (v) => v.trim().length >= 2,
      msg: 'Please enter your full name (minimum 2 characters).',
    },
    patientAge: {
      test: (v) => v >= 1 && v <= 120,
      msg: 'Please enter a valid age between 1 and 120.',
    },
    patientGender: {
      test: (v) => v !== '',
      msg: 'Please select your gender.',
    },
    patientPhone: {
      test: (v) => /^[\+\d\s\-\(\)]{10,15}$/.test(v.trim()),
      msg: 'Please enter a valid phone number.',
    },
    patientEmail: {
      test: (v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      msg: 'Please enter a valid email address.',
      optional: true,
    },
    appointmentDate: {
      test: (v) => v !== '',
      msg: 'Please select your preferred date.',
    },
    appointmentTime: {
      test: (v) => v !== '',
      msg: 'Please select your preferred time.',
    },
    department: {
      test: (v) => v !== '',
      msg: 'Please select a department.',
    },
    symptoms: {
      test: (v) => v.trim().length >= 3,
      msg: 'Please briefly describe your symptoms.',
    },
  };

  /**
   * Validate a single field
   * @param {HTMLElement} input
   * @param {string} name
   * @returns {boolean}
   */
  const validateField = (input, name) => {
    const rule = validators[name];
    if (!rule) return true;
    const value = input.value;
    const errorEl = $(`#${name}Error`);

    if (rule.optional && value === '') {
      input.classList.remove('error', 'success');
      if (errorEl) errorEl.textContent = '';
      return true;
    }

    const valid = rule.test(value);
    input.classList.toggle('error', !valid);
    input.classList.toggle('success', valid);
    if (errorEl) {
      errorEl.textContent = valid ? '' : rule.msg;
    }

    return valid;
  };

  // Real-time validation on blur
  Object.keys(validators).forEach(name => {
    const input = form.elements[name];
    if (!input) return;

    on(input, 'blur', () => validateField(input, name));
    on(input, 'input', debounce(() => {
      if (input.classList.contains('error')) {
        validateField(input, name);
      }
    }, 300));
  });

  // Submit handler
  on(form, 'submit', (e) => {
    e.preventDefault();

    // Validate all fields
    let allValid = true;
    Object.keys(validators).forEach(name => {
      const input = form.elements[name];
      if (input && !validateField(input, name)) {
        allValid = false;
      }
    });

    if (!allValid) {
      // Focus first error field
      const firstError = form.querySelector('.error');
      if (firstError) {
        firstError.focus();
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Show loading state
    const submitBtn = $('#apptSubmitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style="animation:spin-slow 1s linear infinite"><path d="M12 2a10 10 0 110 20A10 10 0 0112 2zm0 2a8 8 0 100 16A8 8 0 0012 4z" opacity=".25"/><path d="M12 2a10 10 0 0110 10h-2A8 8 0 0012 4V2z"/></svg> Confirming…`;

    // Simulate API call
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;

      // Populate modal
      const name = form.elements['patientName'].value.trim();
      const date = form.elements['appointmentDate'].value;
      const time = form.elements['appointmentTime'].value;
      const dept = form.elements['department'];
      const deptText = dept.options[dept.selectedIndex]?.text || '';

      if (modalPatientName) modalPatientName.textContent = name;

      if (modalDetails) {
        const d = new Date(date + 'T00:00:00');
        const formatted = d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeMap = { '09:00': '9:00 AM', '10:00': '10:00 AM', '11:00': '11:00 AM', '12:00': '12:00 PM', '17:00': '5:00 PM', '18:00': '6:00 PM', '19:00': '7:00 PM', '20:00': '8:00 PM' };
        const timeLabel = timeMap[time] || time;
        modalDetails.innerHTML = `
          <strong>📅 Date:</strong> ${formatted}<br/>
          <strong>🕐 Time:</strong> ${timeLabel}<br/>
          <strong>🏥 Department:</strong> ${deptText}<br/>
          <strong>📞 We'll call you at:</strong> ${form.elements['patientPhone'].value}
        `;
      }

      // Show modal
      if (modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        modalClose?.focus();
      }

      // Reset form
      form.reset();
      $$('.form-group input, .form-group select, .form-group textarea', form).forEach(el => {
        el.classList.remove('success', 'error');
      });
    }, 1500);
  });

  // Close modal
  const closeModal = () => {
    if (modal) {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      // Return focus
      $('#apptSubmitBtn')?.focus();
    }
  };

  on(modalClose, 'click', closeModal);
  on(modal, 'click', (e) => {
    if (e.target === modal) closeModal();
  });
  on(document, 'keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('active')) closeModal();
  });
};

/* ─────────────────────────────────────────────────────
   10. Testimonial Slider
───────────────────────────────────────────────────── */
const initTestimonialSlider = () => {
  const slider = $('#testiSlider');
  const prevBtn = $('#testiPrev');
  const nextBtn = $('#testiNext');
  const dotsContainer = $('#testiDots');
  if (!slider) return;

  const cards = $$('.testi-card', slider);
  if (!cards.length) return;

  let current = 0;
  let slidesVisible = getSlidesVisible();
  let autoplayTimer = null;
  const AUTOPLAY_DELAY = 4500;

  function getSlidesVisible() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 992) return 2;
    return 3;
  }

  const totalSlides = Math.max(0, cards.length - slidesVisible + 1);

  // Create dots
  const createDots = () => {
    dotsContainer.innerHTML = '';
    const count = Math.ceil(cards.length / slidesVisible);
    for (let i = 0; i < count; i++) {
      const btn = document.createElement('button');
      btn.className = `testi-dot${i === 0 ? ' active' : ''}`;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', `Testimonial group ${i + 1}`);
      btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      on(btn, 'click', () => goTo(i * slidesVisible));
      dotsContainer.appendChild(btn);
    }
  };

  const updateDots = () => {
    const dots = $$('.testi-dot', dotsContainer);
    const activeGroup = Math.floor(current / slidesVisible);
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === activeGroup);
      dot.setAttribute('aria-selected', i === activeGroup ? 'true' : 'false');
    });
  };

  const goTo = (index) => {
    current = Math.max(0, Math.min(index, Math.max(0, cards.length - slidesVisible)));

    // Mobile: show only active card
    if (slidesVisible === 1) {
      cards.forEach((card, i) => {
        card.classList.toggle('active-slide', i === current);
      });
    }

    // Animate the slider offset
    const cardWidth = cards[0]?.offsetWidth || 0;
    const gap = 32;
    slider.style.transform = `translateX(-${current * (cardWidth + gap)}px)`;
    slider.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

    updateDots();
  };

  const next = () => {
    const next = current + 1;
    goTo(next > Math.max(0, cards.length - slidesVisible) ? 0 : next);
  };

  const prev = () => {
    const p = current - 1;
    goTo(p < 0 ? Math.max(0, cards.length - slidesVisible) : p);
  };

  const startAutoplay = () => {
    stopAutoplay();
    autoplayTimer = setInterval(next, AUTOPLAY_DELAY);
  };

  const stopAutoplay = () => {
    if (autoplayTimer) clearInterval(autoplayTimer);
  };

  on(nextBtn, 'click', () => { next(); startAutoplay(); });
  on(prevBtn, 'click', () => { prev(); startAutoplay(); });

  // Touch/swipe support
  let touchStartX = 0;
  on(slider, 'touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    stopAutoplay();
  }, { passive: true });

  on(slider, 'touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
    startAutoplay();
  }, { passive: true });

  // Pause on hover
  on(slider.parentElement, 'mouseenter', stopAutoplay);
  on(slider.parentElement, 'mouseleave', startAutoplay);

  // Keyboard navigation
  on(slider, 'keydown', (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // Responsive handler
  window.addEventListener('resize', debounce(() => {
    const newVisible = getSlidesVisible();
    if (newVisible !== slidesVisible) {
      slidesVisible = newVisible;
      current = 0;
      createDots();
      goTo(0);
    }
  }, 200));

  // Init
  createDots();
  goTo(0);
  startAutoplay();
};

/* ─────────────────────────────────────────────────────
   11. Gallery Lightbox
───────────────────────────────────────────────────── */
const initGallery = () => {
  const lightbox = $('#lightbox');
  const lightboxContent = $('#lightboxContent');
  const lightboxClose = $('#lightboxClose');
  const lightboxPrev = $('#lightboxPrev');
  const lightboxNext = $('#lightboxNext');
  if (!lightbox) return;

  const galleryItems = $$('.gallery-item');
  let currentIndex = 0;

  const galleryData = [
    { emoji: '🏥', title: 'Modern Reception', desc: 'Welcoming reception area designed for patient comfort', bg: '#E3F2FD' },
    { emoji: '👨‍⚕️', title: 'Consultation Room', desc: 'Private, well-equipped consultation rooms', bg: '#E8F5E9' },
    { emoji: '🛋️', title: 'Waiting Area', desc: 'Comfortable waiting lounge with amenities', bg: '#FFF8E1' },
    { emoji: '🔬', title: 'Medical Equipment', desc: 'State-of-the-art diagnostic equipment', bg: '#F3E5F5' },
    { emoji: '🏆', title: 'Awards & Certifications', desc: 'Recognition for excellence in healthcare', bg: '#FFF3E0' },
    { emoji: '🩺', title: 'Doctor & Patient', desc: 'Personalized care in every consultation', bg: '#E8F4FD' },
  ];

  const showLightbox = (index) => {
    currentIndex = ((index % galleryData.length) + galleryData.length) % galleryData.length;
    const item = galleryData[currentIndex];

    lightboxContent.innerHTML = `
      <div style="
        background: ${item.bg};
        border-radius: 20px;
        width: 600px;
        max-width: 80vw;
        height: 400px;
        max-height: 70vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1rem;
        padding: 2rem;
      " role="img" aria-label="${item.title}">
        <span style="font-size: 5rem; animation: float 2s ease-in-out infinite alternate;" aria-hidden="true">${item.emoji}</span>
        <h3 style="color: #1A1A1A; font-size: 1.3rem; font-weight: 600; text-align: center;">${item.title}</h3>
        <p style="color: #6C757D; font-size: 0.9rem; text-align: center;">${item.desc}</p>
        <span style="color: #0077B6; font-size: 0.75rem; font-weight: 500;">${currentIndex + 1} / ${galleryData.length}</span>
      </div>
    `;

    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    lightboxClose.focus();
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    galleryItems[currentIndex]?.focus();
  };

  // Open on click or Enter/Space key
  galleryItems.forEach((item, index) => {
    const openFn = () => showLightbox(parseInt(item.dataset.index ?? index, 10));
    on(item, 'click', openFn);
    on(item, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFn(); }
    });
  });

  on(lightboxClose, 'click', closeLightbox);
  on(lightboxPrev, 'click', () => showLightbox(currentIndex - 1));
  on(lightboxNext, 'click', () => showLightbox(currentIndex + 1));

  on(lightbox, 'click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  on(document, 'keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showLightbox(currentIndex - 1);
    if (e.key === 'ArrowRight') showLightbox(currentIndex + 1);
  });

  // Touch/swipe
  let touchStart = 0;
  on(lightbox, 'touchstart', (e) => { touchStart = e.touches[0].clientX; }, { passive: true });
  on(lightbox, 'touchend', (e) => {
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? showLightbox(currentIndex + 1) : showLightbox(currentIndex - 1);
  }, { passive: true });
};

/* ─────────────────────────────────────────────────────
   12. FAQ Accordion
───────────────────────────────────────────────────── */
const initAccordion = () => {
  const triggers = $$('.accordion-trigger');

  triggers.forEach(trigger => {
    const contentId = trigger.getAttribute('aria-controls');
    const content = contentId ? document.getElementById(contentId) : null;
    if (!content) return;

    on(trigger, 'click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';

      // Close all others (single-open mode)
      triggers.forEach(t => {
        if (t !== trigger) {
          t.setAttribute('aria-expanded', 'false');
          const c = document.getElementById(t.getAttribute('aria-controls'));
          if (c) c.classList.remove('open');
        }
      });

      // Toggle current
      trigger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      content.classList.toggle('open', !isOpen);

      // Smooth scroll to item if needed
      if (!isOpen) {
        setTimeout(() => {
          const headerH = $('#header')?.offsetHeight || 80;
          const top = trigger.getBoundingClientRect().top + window.scrollY - headerH - 20;
          window.scrollTo({ top, behavior: 'smooth' });
        }, 100);
      }
    });

    // Keyboard support
    on(trigger, 'keydown', (e) => {
      const items = $$('.accordion-item');
      const idx = items.indexOf(trigger.closest('.accordion-item'));
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        $$('.accordion-trigger')[idx + 1]?.focus();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        $$('.accordion-trigger')[idx - 1]?.focus();
      }
      if (e.key === 'Home') { e.preventDefault(); $$('.accordion-trigger')[0]?.focus(); }
      if (e.key === 'End') { e.preventDefault(); $$('.accordion-trigger').at(-1)?.focus(); }
    });
  });
};

/* ─────────────────────────────────────────────────────
   13. Back to Top
───────────────────────────────────────────────────── */
const initBackToTop = () => {
  const btn = $('#backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  on(btn, 'click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
};

/* ─────────────────────────────────────────────────────
   14. Button Ripple Effect
───────────────────────────────────────────────────── */
const initRipple = () => {
  $$('.btn-ripple').forEach(btn => {
    on(btn, 'click', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255,255,255,0.4);
        transform: scale(0);
        animation: ripple-expand 0.6s linear;
        pointer-events: none;
        left: ${x - 50}px;
        top: ${y - 50}px;
        width: 100px;
        height: 100px;
      `;

      // Add ripple keyframes if not present
      if (!document.getElementById('rippleStyle')) {
        const style = document.createElement('style');
        style.id = 'rippleStyle';
        style.textContent = `
          @keyframes ripple-expand {
            to { transform: scale(4); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }

      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);

      setTimeout(() => ripple.remove(), 700);
    });
  });
};

/* ─────────────────────────────────────────────────────
   15. Contact Quick Form
───────────────────────────────────────────────────── */
const initContactForm = () => {
  const form = $('#contactForm');
  if (!form) return;

  on(form, 'submit', (e) => {
    e.preventDefault();

    const name = $('#cName')?.value?.trim();
    const msg = $('#cMsg')?.value?.trim();

    if (!name || !msg) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
      form.reset();
      showToast('Message sent! We\'ll contact you shortly.', 'success');
    }, 1200);
  });
};

/* ─────────────────────────────────────────────────────
   16. Newsletter Form
───────────────────────────────────────────────────── */
const initNewsletter = () => {
  const form = $('#newsletterForm');
  if (!form) return;

  on(form, 'submit', (e) => {
    e.preventDefault();
    const email = $('#newsletterEmail')?.value?.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    const btn = form.querySelector('button');
    btn.textContent = 'Subscribing…';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = 'Subscribe';
      btn.disabled = false;
      form.reset();
      showToast('🎉 Subscribed! Thank you for joining.', 'success');
    }, 1000);
  });
};

/* ─────────────────────────────────────────────────────
   Toast Notification Helper
───────────────────────────────────────────────────── */
const showToast = (message, type = 'success') => {
  // Remove existing toast
  $('#toast')?.remove();

  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%) translateY(80px);
    background: ${type === 'success' ? '#2ECC71' : '#E74C3C'};
    color: white;
    padding: 0.9rem 2rem;
    border-radius: 50px;
    font-size: 0.9rem;
    font-weight: 500;
    font-family: 'Poppins', sans-serif;
    box-shadow: 0 8px 30px rgba(0,0,0,0.2);
    z-index: 9998;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.4s ease;
    opacity: 0;
    pointer-events: none;
    max-width: 90vw;
    text-align: center;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
    toast.style.opacity = '1';
  });

  // Animate out
  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(80px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 3500);
};

/* ─────────────────────────────────────────────────────
   17. Page Transitions (Anchor clicks from external)
───────────────────────────────────────────────────── */
const initPageTransition = () => {
  // Add entrance animation to main content
  const main = $('#main-content');
  if (main) {
    main.style.opacity = '0';
    main.style.transform = 'translateY(10px)';
    main.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

    window.addEventListener('load', () => {
      setTimeout(() => {
        main.style.opacity = '1';
        main.style.transform = 'translateY(0)';
      }, 700);
    });
  }
};

/* ─────────────────────────────────────────────────────
   18. Active Nav Link on Scroll (Spy)
───────────────────────────────────────────────────── */
const initScrollSpy = () => {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const getActiveSection = () => {
    const scrollY = window.scrollY;
    const headerH = $('#header')?.offsetHeight || 80;

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const top = section.offsetTop - headerH - 50;
      if (scrollY >= top) {
        return section.id;
      }
    }
    return sections[0]?.id || '';
  };

  const updateNav = debounce(() => {
    const activeId = getActiveSection();
    navLinks.forEach(link => {
      const href = link.getAttribute('href')?.slice(1);
      link.classList.toggle('active', href === activeId);
      link.setAttribute('aria-current', href === activeId ? 'page' : 'false');
    });
  }, 50);

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
};

/* ─────────────────────────────────────────────────────
   19. Lazy Loading Images (native + fallback)
───────────────────────────────────────────────────── */
const initLazyLoad = () => {
  // Native lazy loading for iframes
  $$('iframe[src]').forEach(iframe => {
    if (!iframe.hasAttribute('loading')) {
      iframe.setAttribute('loading', 'lazy');
    }
  });

  // IntersectionObserver for custom lazy elements
  const lazyEls = $$('[data-src]');
  if (!lazyEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const src = el.dataset.src;
        if (src) {
          if (el.tagName === 'IMG') {
            el.src = src;
          } else {
            el.style.backgroundImage = `url(${src})`;
          }
          el.removeAttribute('data-src');
        }
        observer.unobserve(el);
      }
    });
  }, { rootMargin: '200px 0px' });

  lazyEls.forEach(el => observer.observe(el));
};

/* ─────────────────────────────────────────────────────
   20. Floating Icons Subtle Parallax
───────────────────────────────────────────────────── */
const initFloatingIconsParallax = () => {
  const icons = $$('.ficon');
  if (!icons.length) return;

  let ticking = false;

  window.addEventListener('mousemove', (e) => {
    if (ticking) return;
    ticking = true;

    requestAnimationFrame(() => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;

      icons.forEach((icon, i) => {
        const depth = (i % 3 + 1) * 5;
        const tx = x * depth;
        const ty = y * depth;
        icon.style.transform = `translate(${tx}px, ${ty}px)`;
      });

      ticking = false;
    });
  }, { passive: true });
};



/* ─────────────────────────────────────────────────────
   Keyboard Accessibility Enhancements
───────────────────────────────────────────────────── */
const initA11y = () => {
  // Skip to content link (create if not exists)
  if (!$('#skip-link')) {
    const skip = document.createElement('a');
    skip.id = 'skip-link';
    skip.href = '#main-content';
    skip.textContent = 'Skip to main content';
    skip.style.cssText = `
      position: fixed;
      top: -100%;
      left: 1rem;
      z-index: 99999;
      background: var(--primary);
      color: white;
      padding: 0.6rem 1.5rem;
      border-radius: 0 0 8px 8px;
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      font-size: 0.9rem;
      transition: top 0.3s;
      text-decoration: none;
    `;
    skip.addEventListener('focus', () => { skip.style.top = '0'; });
    skip.addEventListener('blur', () => { skip.style.top = '-100%'; });
    document.body.insertBefore(skip, document.body.firstChild);
  }

  // Add focus ring for keyboard navigation only
  document.addEventListener('mousedown', () => {
    document.body.classList.add('using-mouse');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.remove('using-mouse');
    }
  });

  if (!document.getElementById('a11yStyle')) {
    const style = document.createElement('style');
    style.id = 'a11yStyle';
    style.textContent = `
      .using-mouse *:focus { outline: none !important; }
    `;
    document.head.appendChild(style);
  }
};

/* ─────────────────────────────────────────────────────
   Service Card Keyboard Focus
───────────────────────────────────────────────────── */
const initServiceCards = () => {
  $$('.service-card[tabindex]').forEach(card => {
    on(card, 'click', (e) => {
      // If they clicked the link directly, let the link handle it
      if (e.target.tagName.toLowerCase() === 'a') return;
      const link = card.querySelector('.service-link, a');
      link?.click();
    });
    on(card, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const link = card.querySelector('.service-link, a');
        link?.click();
      }
    });
  });
};

/* ─────────────────────────────────────────────────────
   Performance: Preload critical resources
───────────────────────────────────────────────────── */
const preloadResources = () => {
  // Fonts are already loaded via Google Fonts link
  // Log performance mark
  if (performance?.mark) {
    performance.mark('app-init');
  }
};

/* ─────────────────────────────────────────────────────
   INIT — Run everything on DOMContentLoaded
───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  preloadResources();
  initLoader();
  initDarkMode();
  initNavbar();
  initSmoothScroll();
  initScrollProgress();
  initScrollReveal();
  initCounters();
  initTypingEffect();
  initAppointmentForm();
  initTestimonialSlider();
  initGallery();
  initAccordion();
  initBackToTop();
  initRipple();
  initContactForm();
  initNewsletter();
  initPageTransition();
  initScrollSpy();
  initLazyLoad();
  initFloatingIconsParallax();

  initServiceCards();
  initA11y();

  // Log initialization
  console.log(
    '%c🌿 Dr. Ananya Singh Ayurvedic Clinic%c\nWebsite loaded successfully.',
    'color: #0077B6; font-size: 1.2rem; font-weight: bold;',
    'color: #6C757D; font-size: 0.85rem;'
  );
});
