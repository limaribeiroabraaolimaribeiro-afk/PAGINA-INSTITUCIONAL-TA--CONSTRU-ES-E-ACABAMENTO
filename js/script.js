(function(){
  'use strict';

  var WHATSAPP_NUMBER = '5547992827227';
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var motionOn = !prefersReducedMotion && hasGsap;

  /* ---------------------------------------------------
     WhatsApp links — build wa.me URLs with encoded text
  --------------------------------------------------- */
  function initWhatsAppLinks(){
    var links = document.querySelectorAll('[data-wa]');
    links.forEach(function(link){
      var text = link.getAttribute('data-wa-text') || '';
      var url = 'https://wa.me/' + WHATSAPP_NUMBER + (text ? '?text=' + encodeURIComponent(text) : '');
      link.setAttribute('href', url);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
  }

  /* ---------------------------------------------------
     Header — transparent over hero, solid after scroll
  --------------------------------------------------- */
  function initHeaderScroll(){
    var header = document.getElementById('siteHeader');
    if(!header) return;
    var ticking = false;
    function update(){
      header.classList.toggle('is-scrolled', window.scrollY > 30);
      ticking = false;
    }
    window.addEventListener('scroll', function(){
      if(!ticking){
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive:true });
    update();
  }

  /* ---------------------------------------------------
     Mobile nav overlay
  --------------------------------------------------- */
  function initMobileNav(){
    var toggle = document.getElementById('menuToggle');
    var nav = document.getElementById('mobileNav');
    if(!toggle || !nav) return;

    function openNav(){
      nav.setAttribute('data-open','true');
      nav.setAttribute('aria-hidden','false');
      toggle.setAttribute('aria-expanded','true');
      toggle.setAttribute('aria-label','Fechar menu');
      document.body.classList.add('nav-open');
    }
    function closeNav(){
      nav.setAttribute('data-open','false');
      nav.setAttribute('aria-hidden','true');
      toggle.setAttribute('aria-expanded','false');
      toggle.setAttribute('aria-label','Abrir menu');
      document.body.classList.remove('nav-open');
    }
    toggle.addEventListener('click', function(){
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', closeNav);
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') closeNav();
    });
  }

  /* ---------------------------------------------------
     Services — desktop hover preview
  --------------------------------------------------- */
  function initServicesPreview(){
    var rows = document.querySelectorAll('.service');
    var previews = document.querySelectorAll('.services__preview-frame img');
    if(!rows.length || !previews.length) return;

    function activate(index){
      previews.forEach(function(img){
        img.classList.toggle('is-active', img.getAttribute('data-preview') === String(index));
      });
    }
    activate(0);

    rows.forEach(function(row){
      var idx = row.getAttribute('data-service');
      row.addEventListener('mouseenter', function(){ activate(idx); });
      row.addEventListener('focusin', function(){ activate(idx); });
    });
  }

  /* ---------------------------------------------------
     Lightbox (gallery)
  --------------------------------------------------- */
  var galleryItems = [];

  function initLightbox(){
    var lightbox = document.getElementById('lightbox');
    var imgEl = document.getElementById('lightboxImg');
    var captionEl = document.getElementById('lightboxCaption');
    var closeBtn = document.getElementById('lightboxClose');
    var prevBtn = document.getElementById('lightboxPrev');
    var nextBtn = document.getElementById('lightboxNext');
    if(!lightbox) return;

    galleryItems = Array.prototype.slice.call(document.querySelectorAll('.gallery [data-lightbox-trigger]'));
    if(!galleryItems.length) return;

    var currentIndex = 0;
    var lastFocused = null;

    function show(index){
      currentIndex = (index + galleryItems.length) % galleryItems.length;
      var trigger = galleryItems[currentIndex];
      var img = trigger.querySelector('img');
      imgEl.src = img.src;
      imgEl.alt = img.alt;
      captionEl.textContent = trigger.getAttribute('data-caption') || '';
    }

    function open(index){
      lastFocused = document.activeElement;
      show(index);
      lightbox.hidden = false;
      requestAnimationFrame(function(){ lightbox.setAttribute('data-open','true'); });
      document.body.classList.add('nav-open');
      closeBtn.focus();
      document.addEventListener('keydown', onKeydown);
    }

    function close(){
      lightbox.setAttribute('data-open','false');
      document.body.classList.remove('nav-open');
      document.removeEventListener('keydown', onKeydown);
      setTimeout(function(){ lightbox.hidden = true; }, 300);
      if(lastFocused) lastFocused.focus();
    }

    function onKeydown(e){
      if(e.key === 'Escape') close();
      if(e.key === 'ArrowRight') show(currentIndex + 1);
      if(e.key === 'ArrowLeft') show(currentIndex - 1);
    }

    galleryItems.forEach(function(trigger, i){
      trigger.addEventListener('click', function(){ open(i); });
    });

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function(){ show(currentIndex - 1); });
    nextBtn.addEventListener('click', function(){ show(currentIndex + 1); });
    lightbox.addEventListener('click', function(e){
      if(e.target === lightbox) close();
    });
  }

  /* ---------------------------------------------------
     Bancada scene — responsive scale
  --------------------------------------------------- */
  function initBancadaScale(){
    var scene = document.getElementById('bancadaScene');
    if(!scene) return;
    function update(){
      var bs = Math.min(1, scene.clientWidth / 640);
      scene.style.setProperty('--bs', bs.toFixed(4));
    }
    update();
    window.addEventListener('resize', function(){
      update();
      if(hasGsap) window.ScrollTrigger.refresh();
    }, { passive:true });
  }

  /* ---------------------------------------------------
     GSAP — hero intro choreography
  --------------------------------------------------- */
  function initHeroIntro(){
    var gsap = window.gsap;
    var lines = gsap.utils.toArray('.hero__title [data-intro="line"]');
    var goldLine = document.querySelector('.hero__title [data-intro="gold"]');

    gsap.set('.hero__img', { scale:1.06 });
    /* y:0 clears the CSS translateY guard so only yPercent drives the reveal */
    gsap.set(lines.concat([goldLine]), { yPercent:110, y:0 });

    var tl = gsap.timeline({ defaults:{ ease:'power3.out' } });

    tl.to('.hero__img', { scale:1, duration:2.6, ease:'power2.out' }, 0)
      .to('[data-intro="header"]', { opacity:1, duration:.9 }, .35)
      .fromTo('[data-intro="eyebrow"]',
        { opacity:0, x:-24 },
        { opacity:1, x:0, duration:.9 }, .55)
      .to(lines, { yPercent:0, duration:1.05, stagger:.13, opacity:1 }, .75)
      .to(goldLine, { yPercent:0, duration:1.15, opacity:1, ease:'power4.out' }, 1.28)
      .fromTo('[data-intro="text"]',
        { opacity:0, y:22 },
        { opacity:1, y:0, duration:.9 }, 1.75)
      .fromTo('[data-intro="cta"]',
        { opacity:0, y:22 },
        { opacity:1, y:0, duration:.9 }, 1.95)
      .to('[data-intro="scroll"]', { opacity:1, duration:1 }, 2.3);

    /* hero parallax on scroll — sutil, com micro-zoom para dar profundidade.
       Aplicado no contêiner para não disputar o scale da <img> com a intro. */
    gsap.to('.hero__media', {
      yPercent:9,
      scale:1.04,
      ease:'none',
      scrollTrigger:{ trigger:'.hero', start:'top top', end:'bottom top', scrub:true }
    });
    gsap.to('.hero__content', {
      yPercent:-5,
      opacity:.5,
      ease:'none',
      scrollTrigger:{ trigger:'.hero', start:'top top', end:'75% top', scrub:true }
    });
  }

  /* ---------------------------------------------------
     GSAP — generic reveals
  --------------------------------------------------- */
  function initReveals(){
    var gsap = window.gsap;

    gsap.utils.toArray('[data-reveal]').forEach(function(el){
      gsap.fromTo(el,
        { opacity:0, y:38 },
        {
          opacity:1, y:0,
          duration:1.05,
          ease:'power3.out',
          scrollTrigger:{ trigger:el, start:'top 88%', once:true }
        });
    });

    gsap.utils.toArray('[data-reveal-lines]').forEach(function(el){
      var lines = el.querySelectorAll('.line__in');
      gsap.fromTo(lines,
        { yPercent:110 },
        {
          yPercent:0,
          duration:1.1,
          stagger:.14,
          ease:'power4.out',
          scrollTrigger:{ trigger:el, start:'top 86%', once:true }
        });
    });
  }

  /* ---------------------------------------------------
     GSAP — gallery reveals + internal parallax
  --------------------------------------------------- */
  function initGallery(){
    var gsap = window.gsap;

    gsap.utils.toArray('[data-gimg]').forEach(function(fig){
      var mask = fig.querySelector('.gitem__mask');
      var cap = fig.querySelector('.gitem__cap');

      gsap.fromTo(mask,
        { clipPath:'inset(0 0 100% 0)' },
        {
          clipPath:'inset(0 0 0% 0)',
          duration:1.25,
          ease:'power4.out',
          scrollTrigger:{ trigger:fig, start:'top 86%', once:true }
        });
      if(cap){
        gsap.fromTo(cap,
          { opacity:0, y:14 },
          {
            opacity:1, y:0,
            duration:.9,
            delay:.35,
            ease:'power3.out',
            scrollTrigger:{ trigger:fig, start:'top 86%', once:true }
          });
      }
    });

    /* internal parallax on featured images */
    gsap.utils.toArray('[data-gparallax] .gitem__mask img').forEach(function(img){
      gsap.set(img, { scale:1.18 });
      gsap.fromTo(img,
        { yPercent:-7 },
        {
          yPercent:7,
          ease:'none',
          scrollTrigger:{ trigger:img.closest('figure'), start:'top bottom', end:'bottom top', scrub:true }
        });
    });
  }

  /* ---------------------------------------------------
     GSAP — cinematic section
  --------------------------------------------------- */
  function initCinema(){
    var gsap = window.gsap;
    var section = document.querySelector('.cinema');
    if(!section) return;

    gsap.fromTo('.cinema__img',
      { scale:1.05 },
      {
        scale:1.18,
        ease:'none',
        scrollTrigger:{ trigger:section, start:'top bottom', end:'bottom top', scrub:true }
      });
  }

  /* ---------------------------------------------------
     GSAP — CTA background drift
  --------------------------------------------------- */
  function initCta(){
    var gsap = window.gsap;
    var section = document.querySelector('.cta');
    if(!section) return;

    gsap.fromTo('.cta__img',
      { yPercent:-8 },
      {
        yPercent:8,
        ease:'none',
        scrollTrigger:{ trigger:section, start:'top bottom', end:'bottom top', scrub:true }
      });
  }

  /* ---------------------------------------------------
     GSAP — processo timeline fill
  --------------------------------------------------- */
  function initProcesso(){
    var gsap = window.gsap;
    var fill = document.getElementById('processoFill');
    var steps = document.getElementById('processoSteps');
    if(!fill || !steps) return;

    var mm = gsap.matchMedia();

    mm.add('(min-width: 900px)', function(){
      gsap.fromTo(fill,
        { scaleX:0 },
        {
          scaleX:1,
          ease:'none',
          scrollTrigger:{ trigger:steps, start:'top 75%', end:'bottom 55%', scrub:true }
        });
    });
    mm.add('(max-width: 899.98px)', function(){
      gsap.fromTo(fill,
        { scaleY:0 },
        {
          scaleY:1,
          ease:'none',
          scrollTrigger:{ trigger:steps, start:'top 78%', end:'bottom 60%', scrub:true }
        });
    });
  }

  /* ---------------------------------------------------
     GSAP — bancada assembly (scroll-scrubbed)
  --------------------------------------------------- */
  function initMontagem(){
    var gsap = window.gsap;
    var section = document.querySelector('.montagem');
    if(!section) return;

    var q = function(sel){ return section.querySelector(sel); };

    var shadow = q('[data-m="shadow"]');
    var voidEl = q('[data-m="void"]');
    var base = q('.piece--base');
    var left = q('.piece--left');
    var right = q('.piece--right');
    var tampo = q('.piece--tampo');
    var cuba = q('.piece--cuba');
    var shine = q('[data-m="shine"]');
    var t1 = q('[data-m="t1"]');
    var t2 = q('[data-m="t2"]');
    var scene = q('.bancada__scene');

    /* scattered start */
    gsap.set(shadow, { opacity:0 });
    gsap.set(voidEl, { opacity:0 });
    gsap.set(base,  { y:190, opacity:0 });
    gsap.set(left,  { x:-360, rotationY:38, rotationZ:-4, opacity:0, transformPerspective:900 });
    gsap.set(right, { x:360, rotationY:-38, rotationZ:4, opacity:0, transformPerspective:900 });
    gsap.set(tampo, { x:440, y:-40, rotationZ:2.5, rotationY:-16, opacity:0, transformPerspective:1100 });
    gsap.set(cuba,  { y:-330, opacity:0 });
    gsap.set([t1, t2], { y:34, opacity:0 });

    var tl = gsap.timeline({
      defaults:{ ease:'power2.inOut' },
      scrollTrigger:{
        trigger:section,
        start:'top top',
        end:'+=260%',
        scrub:.6,
        pin:true,
        anticipatePin:1
      }
    });

    tl.to(voidEl, { opacity:1, duration:.8 }, 0)
      .to(shadow, { opacity:.6, duration:1 }, .2)

      /* 1. base rises from below */
      .to(base, { y:0, opacity:1, duration:1.3, ease:'power2.out' }, .3)

      /* 2. side panels slide in and lock */
      .to(left,  { x:0, rotationY:0, rotationZ:0, opacity:1, duration:1.5, ease:'power2.out' }, 1.5)
      .to(right, { x:0, rotationY:0, rotationZ:0, opacity:1, duration:1.5, ease:'power2.out' }, 1.9)

      /* 3. countertop slab slides in horizontally */
      .to(tampo, { x:0, y:0, rotationZ:0, rotationY:0, opacity:1, duration:1.7, ease:'power2.out' }, 3.5)

      /* 4. cuba drops and settles */
      .to(cuba, { y:10, opacity:1, duration:.9, ease:'power2.in' }, 5.5)
      .to(cuba, { y:0, duration:.35, ease:'power2.out' }, 6.4)
      .to(shadow, { opacity:.95, duration:.8 }, 5.9)

      /* polish sweep across the top */
      .to(shine, { backgroundPosition:'-160% 0', duration:1.1, ease:'power1.inOut' }, 6.9)

      /* reveal message */
      .to(scene, { y:-26, duration:1.6, ease:'power1.inOut' }, 7.6)
      .to(t1, { y:0, opacity:1, duration:1.2, ease:'power3.out' }, 7.8)
      .to(t2, { y:0, opacity:1, duration:1.2, ease:'power3.out' }, 8.4)
      .to({}, { duration:.6 });
  }

  /* ---------------------------------------------------
     Motion bootstrap
  --------------------------------------------------- */
  function initMotion(){
    if(!motionOn){
      document.documentElement.classList.remove('motion');
      return;
    }
    window.gsap.registerPlugin(window.ScrollTrigger);

    initHeroIntro();
    initReveals();
    initGallery();
    initCinema();
    initCta();
    initProcesso();
    initMontagem();

    window.addEventListener('load', function(){
      window.ScrollTrigger.refresh();
    });
  }

  /* ---------------------------------------------------
     Footer year
  --------------------------------------------------- */
  function initFooterYear(){
    var el = document.getElementById('copyYear');
    if(el) el.textContent = new Date().getFullYear();
  }

  /* ---------------------------------------------------
     Init
  --------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function(){
    initWhatsAppLinks();
    initHeaderScroll();
    initMobileNav();
    initServicesPreview();
    initLightbox();
    initBancadaScale();
    initFooterYear();
    initMotion();
  });
})();
