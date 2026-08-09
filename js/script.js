(function(){
  'use strict';

  var WHATSAPP_NUMBER = '5547992827227';
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
     Sticky header shadow on scroll
  --------------------------------------------------- */
  function initHeaderScroll(){
    var header = document.getElementById('siteHeader');
    if(!header) return;
    var ticking = false;
    function update(){
      header.classList.toggle('is-scrolled', window.scrollY > 8);
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
     Mobile nav drawer
  --------------------------------------------------- */
  function initMobileNav(){
    var toggle = document.getElementById('menuToggle');
    var nav = document.getElementById('mobileNav');
    var backdrop = document.getElementById('mobileNavBackdrop');
    if(!toggle || !nav || !backdrop) return;

    function openNav(){
      nav.setAttribute('data-open','true');
      backdrop.setAttribute('data-open','true');
      toggle.setAttribute('aria-expanded','true');
      toggle.setAttribute('aria-label','Fechar menu');
      document.body.classList.add('nav-open');
    }
    function closeNav(){
      nav.setAttribute('data-open','false');
      backdrop.setAttribute('data-open','false');
      toggle.setAttribute('aria-expanded','false');
      toggle.setAttribute('aria-label','Abrir menu');
      document.body.classList.remove('nav-open');
    }
    toggle.addEventListener('click', function(){
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeNav() : openNav();
    });
    backdrop.addEventListener('click', closeNav);
    nav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', closeNav);
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') closeNav();
    });
  }

  /* ---------------------------------------------------
     Services — show all
  --------------------------------------------------- */
  function initServicesToggle(){
    var btn = document.getElementById('servicesToggle');
    var extras = document.querySelectorAll('.service-card--extra');
    if(!btn || !extras.length) return;

    btn.addEventListener('click', function(){
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      if(expanded){
        extras.forEach(function(card){ card.hidden = true; });
        btn.setAttribute('aria-expanded','false');
        btn.innerHTML = 'VER TODOS OS SERVIÇOS <svg viewBox="0 0 24 24" class="icon icon--sm" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
        btn.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block:'center' });
      } else {
        extras.forEach(function(card){ card.hidden = false; });
        btn.setAttribute('aria-expanded','true');
        btn.innerHTML = 'VER MENOS SERVIÇOS <svg viewBox="0 0 24 24" class="icon icon--sm" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>';
      }
    });
  }

  /* ---------------------------------------------------
     Portfolio carousel — dots + active state
  --------------------------------------------------- */
  var carouselItems = [];

  function initCarousel(){
    var track = document.getElementById('carouselTrack');
    var dotsWrap = document.getElementById('carouselDots');
    if(!track || !dotsWrap) return;

    carouselItems = Array.prototype.slice.call(track.querySelectorAll('.carousel__item'));

    carouselItems.forEach(function(item, i){
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('role','tab');
      dot.setAttribute('aria-label','Ir para fotografia ' + (i+1));
      if(i === 0) dot.classList.add('is-active');
      dot.addEventListener('click', function(){
        item.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', inline:'center', block:'nearest' });
      });
      dotsWrap.appendChild(dot);
    });

    var dots = dotsWrap.querySelectorAll('button');

    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting && entry.intersectionRatio > 0.6){
          var idx = carouselItems.indexOf(entry.target);
          dots.forEach(function(d,i){ d.classList.toggle('is-active', i === idx); });
        }
      });
    }, { root: track, threshold: [0.6] });

    carouselItems.forEach(function(item){ observer.observe(item); });
  }

  /* ---------------------------------------------------
     Lightbox
  --------------------------------------------------- */
  function initLightbox(){
    var lightbox = document.getElementById('lightbox');
    var imgEl = document.getElementById('lightboxImg');
    var captionEl = document.getElementById('lightboxCaption');
    var closeBtn = document.getElementById('lightboxClose');
    var prevBtn = document.getElementById('lightboxPrev');
    var nextBtn = document.getElementById('lightboxNext');
    if(!lightbox || !carouselItems.length) return;

    var currentIndex = 0;
    var lastFocused = null;

    function show(index){
      currentIndex = (index + carouselItems.length) % carouselItems.length;
      var item = carouselItems[currentIndex];
      var img = item.querySelector('img');
      var trigger = item.querySelector('[data-lightbox-trigger]');
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

    carouselItems.forEach(function(item, i){
      var trigger = item.querySelector('[data-lightbox-trigger]');
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
     Scroll reveal animations
  --------------------------------------------------- */
  function initReveal(){
    var items = document.querySelectorAll('.reveal');
    if(!items.length) return;

    if(prefersReducedMotion || !('IntersectionObserver' in window)){
      items.forEach(function(el){ el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry, i){
        if(entry.isIntersecting){
          var el = entry.target;
          setTimeout(function(){ el.classList.add('is-visible'); }, (i % 6) * 70);
          observer.unobserve(el);
        }
      });
    }, { threshold:.12, rootMargin:'0px 0px -40px 0px' });

    items.forEach(function(el){ observer.observe(el); });
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
    initServicesToggle();
    initCarousel();
    initLightbox();
    initReveal();
    initFooterYear();
  });
})();
