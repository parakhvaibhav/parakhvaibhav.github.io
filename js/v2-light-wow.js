/* ============================================================
   V2 LIGHT WOW — JS Enhancement Layer
   Adds: warm bokeh hero canvas, cursor parallax, depth orbs,
         enhanced GSAP reveals, staggered grids.
   Remove this file + script tags to revert.
   ============================================================ */

(function() {
  'use strict';

  // ---- Inject depth layer (floating ambient orbs) ----
  function injectDepthLayer() {
    if (document.querySelector('.v2-depth-layer')) return;
    var layer = document.createElement('div');
    layer.className = 'v2-depth-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML =
      '<div class="v2-depth-layer__orb v2-depth-layer__orb--1"></div>' +
      '<div class="v2-depth-layer__orb v2-depth-layer__orb--2"></div>' +
      '<div class="v2-depth-layer__orb v2-depth-layer__orb--3"></div>';
    document.body.insertBefore(layer, document.body.firstChild);
  }

  // ---- Staggered grid reveals ----
  function staggerGridReveals() {
    var grids = document.querySelectorAll('.explore-grid, .credentials-grid, .finance-projects-grid, .impact-grid');
    grids.forEach(function(grid) {
      var children = grid.querySelectorAll('.reveal');
      children.forEach(function(child, i) {
        child.style.transitionDelay = (i * 80) + 'ms';
      });
    });
  }

  // ============================================================
  // PHASE 2: WARM BOKEH HERO CANVAS
  // Lightweight 2D canvas with warm particles, soft connections,
  // and ambient floating bokeh orbs.
  // ============================================================

  function initHeroBokeh() {
    var canvas = document.getElementById('v2-hero-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width, height;
    var particles = [];
    var bokehOrbs = [];
    var animId = null;
    var isVisible = true;
    var time = 0;

    function resize() {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    }

    function createParticles() {
      particles = [];
      var count = Math.min(Math.floor((width * height) / 18000), 60);
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.12,
          r: Math.random() * 2 + 1,
          opacity: Math.random() * 0.3 + 0.1,
          color: i % 3 === 0 ? '200,121,65' : (i % 3 === 1 ? '79,70,229' : '212,168,83')
        });
      }
    }

    function createBokeh() {
      bokehOrbs = [
        { x: 0.15, y: 0.3, r: 120, color: '200,121,65', opacity: 0.04, speed: 0.0002, phase: 0 },
        { x: 0.8, y: 0.5, r: 100, color: '79,70,229', opacity: 0.035, speed: 0.00025, phase: 2 },
        { x: 0.5, y: 0.8, r: 90, color: '212,168,83', opacity: 0.03, speed: 0.0003, phase: 4 },
        { x: 0.3, y: 0.7, r: 70, color: '200,121,65', opacity: 0.025, speed: 0.00015, phase: 1 },
        { x: 0.7, y: 0.2, r: 80, color: '79,70,229', opacity: 0.03, speed: 0.00028, phase: 3 }
      ];
    }

    function drawBokeh() {
      bokehOrbs.forEach(function(orb) {
        var bx = width * (orb.x + 0.04 * Math.sin(time * orb.speed + orb.phase));
        var by = height * (orb.y + 0.03 * Math.cos(time * orb.speed * 1.2 + orb.phase));
        var gradient = ctx.createRadialGradient(bx, by, 0, bx, by, orb.r);
        gradient.addColorStop(0, 'rgba(' + orb.color + ',' + orb.opacity + ')');
        gradient.addColorStop(0.6, 'rgba(' + orb.color + ',' + (orb.opacity * 0.4) + ')');
        gradient.addColorStop(1, 'rgba(' + orb.color + ',0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      });
    }

    function drawParticles() {
      var connectionDist = Math.min(width, height) * 0.12;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.color + ',' + p.opacity + ')';
        ctx.fill();

        // Draw connections to nearby particles (limited for perf)
        for (var j = i + 1; j < Math.min(i + 8, particles.length); j++) {
          var p2 = particles[j];
          var dx = p.x - p2.x;
          var dy = p.y - p2.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            var lineOpacity = (1 - dist / connectionDist) * 0.08;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = 'rgba(200,121,65,' + lineOpacity + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      if (!isVisible) { animId = null; return; }
      time++;
      ctx.clearRect(0, 0, width, height);
      drawBokeh();
      drawParticles();
      animId = requestAnimationFrame(animate);
    }

    // Visibility observer
    var observer = new IntersectionObserver(function(entries) {
      isVisible = entries[0].isIntersecting;
      if (isVisible && !animId) animate();
    }, { threshold: 0.1 });
    observer.observe(canvas);

    resize();
    createParticles();
    createBokeh();
    animate();

    window.addEventListener('resize', function() {
      resize();
      createParticles();
      createBokeh();
    });
  }

  // ============================================================
  // PHASE 2: CURSOR PARALLAX ON HERO ELEMENTS
  // Desktop only. Moves floating cards + headshot subtly.
  // ============================================================

  function initCursorParallax() {
    if (window.matchMedia('(max-width: 1024px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var hero = document.getElementById('hero');
    if (!hero) return;

    var cards = hero.querySelectorAll('.v2-hero__card');
    var portrait = hero.querySelector('.v2-hero__portrait-frame');
    var routes = hero.querySelector('.v2-hero__routes');

    var targetX = 0, targetY = 0;
    var currentX = 0, currentY = 0;
    var rafId = null;

    hero.addEventListener('mousemove', function(e) {
      var rect = hero.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    });

    hero.addEventListener('mouseleave', function() {
      targetX = 0;
      targetY = 0;
    });

    function lerp(a, b, t) { return a + (b - a) * t; }

    function updateParallax() {
      currentX = lerp(currentX, targetX, 0.06);
      currentY = lerp(currentY, targetY, 0.06);

      // Cards move in opposite direction for depth
      cards.forEach(function(card, i) {
        var depth = (i + 1) * 3;
        var tx = -currentX * depth;
        var ty = -currentY * depth;
        card.style.transform = 'translate(' + tx + 'px, ' + ty + 'px)';
      });

      // Portrait moves subtly
      if (portrait) {
        portrait.style.transform = 'translate(' + (currentX * 4) + 'px, ' + (currentY * 3) + 'px)';
      }

      // Routes drift gently
      if (routes) {
        routes.style.transform = 'translate(' + (-currentX * 5) + 'px, ' + (-currentY * 3) + 'px)';
      }

      rafId = requestAnimationFrame(updateParallax);
    }

    updateParallax();

    // Cleanup on visibility
    var observer = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        if (!rafId) rafId = requestAnimationFrame(updateParallax);
      } else {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      }
    }, { threshold: 0.1 });
    observer.observe(hero);
  }

  // ---- GSAP enhancements (only if GSAP is available) ----
  function initGSAPEnhancements() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Parallax for depth layer orbs
    var orbs = document.querySelectorAll('.v2-depth-layer__orb');
    orbs.forEach(function(orb, i) {
      gsap.to(orb, {
        y: (i + 1) * -40,
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5
        }
      });
    });

    // Section labels: handled by main.js (gsap.from x:-20)
    // No duplicate needed here

    // Stat numbers scale in
    var stats = document.querySelectorAll('.stat');
    stats.forEach(function(stat) {
      gsap.fromTo(stat,
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: stat,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // Page header subtle parallax on sub-pages
    var pageHeader = document.querySelector('.page-header');
    if (pageHeader) {
      gsap.to(pageHeader, {
        backgroundPositionY: '30%',
        scrollTrigger: {
          trigger: pageHeader,
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      });
    }

    // Hero scroll-out handled by main.js (y:-80, opacity:0.3)
    // We only add float-layer fade-out, not a duplicate content tween

    // Portrait side fades out on scroll
    var heroPortrait = document.querySelector('.v2-hero__portrait');
    if (heroPortrait) {
      gsap.to(heroPortrait, {
        opacity: 0,
        y: -20,
        scrollTrigger: {
          trigger: '.hero',
          start: '60% top',
          end: 'bottom top',
          scrub: 1
        }
      });
    }

    // Video section entrance
    var videoPlayer = document.querySelector('.video-player');
    if (videoPlayer) {
      gsap.fromTo(videoPlayer,
        { y: 40, opacity: 0, scale: 0.97 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: videoPlayer,
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      );
    }

    // Explore cards: rely on CSS stagger delays set in staggerGridReveals()
    // and the existing .reveal → .active system from main.js

    // Phase 3: Impact numbers counter pulse
    var impactCards = document.querySelectorAll('.impact-card');
    if (impactCards.length) {
      impactCards.forEach(function(card, i) {
        gsap.fromTo(card,
          { y: 20, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            delay: i * 0.08,
            ease: 'back.out(1.4)',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    }

    // Phase 3: Testimonials slide in from left
    var testimonials = document.querySelectorAll('.testimonial');
    if (testimonials.length) {
      testimonials.forEach(function(t, i) {
        gsap.fromTo(t,
          { x: -20, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.7,
            delay: i * 0.12,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: t,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    }

    // Phase 3: Timeline markers stagger
    var timelineItems = document.querySelectorAll('.h-timeline__item');
    if (timelineItems.length) {
      timelineItems.forEach(function(item, i) {
        gsap.fromTo(item,
          { y: 15, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            delay: i * 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.h-timeline',
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    }

    // Phase 3: World map labels stagger
    var mapLabels = document.querySelectorAll('.world-map__label');
    if (mapLabels.length) {
      mapLabels.forEach(function(label, i) {
        gsap.fromTo(label,
          { y: 20, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.6,
            delay: i * 0.2,
            ease: 'back.out(1.3)',
            scrollTrigger: {
              trigger: '.world-map-img',
              start: 'top 70%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    }

    // Phase 3: AI project diagrams scale in
    var diagrams = document.querySelectorAll('.project__diagram');
    if (diagrams.length) {
      diagrams.forEach(function(d) {
        gsap.fromTo(d,
          { scale: 0.92, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: d,
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        );
      });
    }

    // Blog posts: no GSAP animation — content should be immediately visible
    // The CSS .reveal system handles a fast fade-in via the existing observer
  }

  // ---- Smooth card hover tilt (desktop only) ----
  function initCardTilt() {
    if (window.matchMedia('(max-width: 1024px)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var cards = document.querySelectorAll('.explore-card, .finance-card, .credential-card');

    cards.forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var rotateX = ((y - centerY) / centerY) * -2;
        var rotateY = ((x - centerX) / centerX) * 2;

        card.style.transform = 'translateY(-6px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
      });

      card.addEventListener('mouseleave', function() {
        card.style.transform = '';
      });
    });
  }

  // ---- Project image gallery auto-rotation ----
  function initProjectGallery() {
    var galleries = document.querySelectorAll('.project__gallery');
    galleries.forEach(function(gallery) {
      var slides = gallery.querySelectorAll('.project__gallery-slide');
      var dots = gallery.querySelectorAll('.project__gallery-dot');
      if (slides.length <= 1) return;

      var current = 0;

      function showSlide(index) {
        slides[current].style.display = 'none';
        dots[current].classList.remove('project__gallery-dot--active');
        current = index;
        slides[current].style.display = 'block';
        dots[current].classList.add('project__gallery-dot--active');
      }

      // Auto-rotate every 4 seconds
      setInterval(function() {
        showSlide((current + 1) % slides.length);
      }, 4000);

      // Click dots to navigate
      dots.forEach(function(dot, i) {
        dot.addEventListener('click', function() {
          showSlide(i);
        });
      });
    });
  }

  // ---- Init ----
  function init() {
    injectDepthLayer();
    staggerGridReveals();
    initHeroBokeh();
    initCursorParallax();
    initCardTilt();
    initProjectGallery();

    // Wait for GSAP to load (it's deferred)
    var gsapCheck = setInterval(function() {
      if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        clearInterval(gsapCheck);
        initGSAPEnhancements();
      }
    }, 100);

    setTimeout(function() { clearInterval(gsapCheck); }, 5000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
