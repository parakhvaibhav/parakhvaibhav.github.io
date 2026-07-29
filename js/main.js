document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollReveals();
  initVideoPlayer();
  initArticles();
  waitForGSAP();
});

/* ===== NAVIGATION ===== */
function initNavigation() {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  const hero = document.getElementById('hero');

  // Nav always visible — no scroll-based hiding

  if (toggle) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('mobile-open');
    });
  }

  if (links) {
    links.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        links.classList.remove('mobile-open');
      });
    });
  }

  // Close contact dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.nav__dropdown');
    const btn = document.querySelector('.nav__contact-btn');
    if (dropdown && !dropdown.contains(e.target) && e.target !== btn) {
      dropdown.classList.remove('open');
    }
  });
}

/* ===== SCROLL REVEALS ===== */
function initScrollReveals() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.01, rootMargin: '0px 0px 200px 0px' });

  reveals.forEach(el => observer.observe(el));

  // DD flags animation
  const ddVisuals = document.querySelectorAll('.dd-visual');
  const ddObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        ddObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  ddVisuals.forEach(el => ddObserver.observe(el));

  // Chart line animation
  const chartLines = document.querySelectorAll('.chart-line');
  const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        chartObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  chartLines.forEach(el => chartObserver.observe(el));

  // Timeline line animation
  const timelineLine = document.querySelector('.timeline__line');
  if (timelineLine) {
    const tlObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        timelineLine.classList.add('animated');
        tlObserver.unobserve(entry.target);
      }
    }, { threshold: 0.2 });
    tlObserver.observe(timelineLine);
  }
}

/* ===== COUNTER ANIMATION ===== */
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'));
        const prefix = el.getAttribute('data-prefix') || '';
        const duration = 2000;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(eased * target);
          el.textContent = prefix + current;
          if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => counterObserver.observe(el));
}

/* ===== VIDEO PLAYER ===== */
function initVideoPlayer() {
  const thumbnail = document.getElementById('video-thumbnail');
  const embed = document.getElementById('video-embed');
  if (!thumbnail || !embed) return;

  thumbnail.addEventListener('click', () => {
    const iframe = embed.querySelector('iframe');
    const src = iframe.getAttribute('data-src');
    if (src && src.includes('VIDEO_ID')) return; // Don't play placeholder
    iframe.src = src;
    thumbnail.style.display = 'none';
    embed.style.display = 'block';
  });
}

/* ===== ARTICLES DATA ===== */
function initArticles() {
  const articles = [
    {
      tag: 'AI & LEARNING',
      title: 'AI Fundamentals for Experienced Users',
      excerpt: 'Why experienced practitioners benefit most from beginner-level courses — and the 3 critical gaps I discovered after 8 Anthropic certifications.',
      url: 'https://www.linkedin.com/posts/vaibhavparakh_ive-been-using-ai-tools-for-over-a-year-activity-7479957355065962496-cdlW'
    },
    {
      tag: 'FINANCE & MARKETS',
      title: 'What the Fed\'s Rate Cut Means Today',
      excerpt: 'Breaking down the implications of today\'s rate decision for fixed income markets and structured products.',
      url: 'https://www.linkedin.com/posts/vaibhavparakh_here-is-what-i-think-the-feds-rate-cut-today-activity-7404677590575349760-UUcw'
    }
  ];

  const grid = document.getElementById('articles-grid');
  if (!grid) return;

  grid.innerHTML = articles.map(a => `
    <a href="${a.url}" target="_blank" rel="noopener" class="article-card reveal">
      <div class="article-card__tag">${a.tag}</div>
      <h3 class="article-card__title">${a.title}</h3>
      <p class="article-card__excerpt">${a.excerpt}</p>
      <span class="article-card__link">Read on LinkedIn</span>
    </a>
  `).join('');

  // Re-observe newly added elements
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  grid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ===== GSAP ANIMATIONS ===== */
function waitForGSAP() {
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    initGSAP();
  } else {
    setTimeout(waitForGSAP, 100);
  }
}

function initGSAP() {
  gsap.registerPlugin(ScrollTrigger);

  // Hero parallax
  gsap.to('.hero__content', {
    y: -80,
    opacity: 0.3,
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  // Counter animations
  animateCounters();

  // Smooth section label animations
  gsap.utils.toArray('.section__label').forEach(label => {
    gsap.from(label, {
      x: -20,
      scrollTrigger: {
        trigger: label,
        start: 'top 85%',
        toggleActions: 'play none none none'
      }
    });
  });
}
