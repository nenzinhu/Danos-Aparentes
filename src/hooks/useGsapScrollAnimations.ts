'use client';
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function initScrollAnimations() {
  const ctx = gsap.context(() => {
    // --- 1. SPOTLIGHT CURSOR GLOW NOS CARDS (.spotlight-card / .gsap-card) ---
    const cards = document.querySelectorAll<HTMLElement>('.spotlight-card, .gsap-card');
    cards.forEach((card) => {
      const handleMouseMove = (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      };
      card.addEventListener('mousemove', handleMouseMove);
    });

    // --- 2. HERO TILT 3D COM PERSPECTIVA (.gsap-hero-3d) ---
    const heroContainer = document.querySelector<HTMLElement>('.gsap-hero-container');
    const hero3D = document.querySelector<HTMLElement>('.gsap-hero-3d');
    if (heroContainer && hero3D) {
      heroContainer.addEventListener('mousemove', (e) => {
        const rect = heroContainer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const percentX = (e.clientX - centerX) / (rect.width / 2);
        const percentY = (e.clientY - centerY) / (rect.height / 2);

        gsap.to(hero3D, {
          rotationY: percentX * 8,
          rotationX: -percentY * 8,
          duration: 0.5,
          ease: 'power2.out',
          transformPerspective: 1200,
        });
      });

      heroContainer.addEventListener('mouseleave', () => {
        gsap.to(hero3D, {
          rotationX: 0,
          rotationY: 0,
          duration: 0.8,
          ease: 'power2.out',
        });
      });
    }

    // --- 3. ATRAÇÃO MAGNÉTICA NOS BOTÕES CTA (.gsap-btn-magnetic, .gsap-btn) ---
    const magneticBtns = document.querySelectorAll<HTMLElement>('.gsap-btn-magnetic, .gsap-btn');
    magneticBtns.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - (rect.left + rect.width / 2);
        const y = e.clientY - (rect.top + rect.height / 2);
        gsap.to(btn, {
          x: x * 0.25,
          y: y * 0.25,
          scale: 1.04,
          duration: 0.3,
          ease: 'power2.out',
        });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: 'elastic.out(1, 0.4)',
        });
      });
    });

    // --- 4. SCANNER LASER PERICIAL NO PREVIEW DO PDF (.pdf-scan-line) ---
    const scanLines = document.querySelectorAll('.pdf-scan-line');
    if (scanLines.length > 0) {
      gsap.to(scanLines, {
        top: '98%',
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }

    // --- 5. SCROLLTRIGGER STAGGER ENTRADA DE CARDS (.gsap-card) ---
    gsap.from('.gsap-card', {
      opacity: 0,
      y: 45,
      scale: 0.95,
      duration: 0.8,
      stagger: 0.15,
      ease: 'back.out(1.4)',
      scrollTrigger: {
        trigger: '.gsap-cards-container',
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      },
    });

    // --- 6. CONTADORES NUMÉRICOS DE PERFORMANCE (.gsap-counter) ---
    const counters = document.querySelectorAll('.gsap-counter');
    counters.forEach((counter) => {
      const targetVal = parseFloat(counter.getAttribute('data-target') || '100');
      const suffix = counter.getAttribute('data-suffix') || '';
      const obj = { val: 0 };

      gsap.to(obj, {
        val: targetVal,
        duration: 1.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: counter,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        onUpdate: () => {
          counter.textContent = `${Math.floor(obj.val)}${suffix}`;
        },
      });
    });

    // --- 7. AMBIENT BACKGROUND GLOW ORBS (.bg-glow-orb) ---
    gsap.to('.bg-glow-orb-1', {
      y: '-=40',
      x: '+=30',
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    gsap.to('.bg-glow-orb-2', {
      y: '+=50',
      x: '-=35',
      duration: 8,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // --- REVELAÇÕES ADICIONAIS DE HERO E TÍTULOS ---
    gsap.from('.gsap-hero-item', {
      opacity: 0,
      y: 35,
      duration: 0.9,
      stagger: 0.15,
      ease: 'power3.out',
    });

    gsap.utils.toArray<HTMLElement>('.gsap-section-title').forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      });
    });

    // --- 8. ENTRADA DO HEADER (.gsap-header-item) ---
    gsap.from('.gsap-header-item', {
      opacity: 0,
      y: -14,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power3.out',
    });

    // --- 9. PROFUNDIDADE NO MOBILE (.gsap-depth-item) ---
    // Hover/tilt/spotlight acima não existem no toque; no mobile, esses
    // elementos ganham uma leve entrada com perspectiva ao invés disso.
    const depthMM = gsap.matchMedia();
    depthMM.add('(max-width: 767px)', () => {
      gsap.utils.toArray<HTMLElement>('.gsap-depth-item').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 24,
          rotationX: 8,
          transformPerspective: 800,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        });
      });
    });

  });

  return () => ctx.revert();
}

export function useGsapScrollAnimations() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const cleanup = initScrollAnimations();
    return cleanup;
  }, []);

  useEffect(() => {
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      const cleanup = initScrollAnimations()
      return cleanup
    }

    // Efeitos leves do hero podem rodar no mount sem custo.
    // ScrollTriggers mais pesados começam no primeiro scroll/interação.
    const onScrollOrTouch = () => start()
    window.addEventListener('scroll', onScrollOrTouch, { passive: true, once: true })
    window.addEventListener('touchmove', onScrollOrTouch, { passive: true, once: true })
    window.addEventListener('keydown', onScrollOrTouch, { once: true })

    // Fallback: se o usuário não rolar/interagir em até 1.2s, inicia assim mesmo.
    const fallback = setTimeout(() => start(), 1200)

    return () => {
      window.removeEventListener('scroll', onScrollOrTouch)
      window.removeEventListener('touchmove', onScrollOrTouch)
      window.removeEventListener('keydown', onScrollOrTouch)
      clearTimeout(fallback)
    }
  }, [initScrollAnimations])
}
