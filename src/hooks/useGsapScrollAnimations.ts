'use client';
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const THROTTLE_MS = 16; // ~60fps

function throttle(fn: (e: MouseEvent) => void): (e: MouseEvent) => void {
  let last = 0;
  return function (e: MouseEvent) {
    const now = Date.now();
    if (now - last >= THROTTLE_MS) {
      last = now;
      fn(e);
    }
  };
}

export function useGsapScrollAnimations() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function boot() {
      const ctx = gsap.context(() => {
        if (reducedMotion) {
          ScrollTrigger.defaults({ toggleActions: 'play none none none' });
        }

        // --- 1. SPOTLIGHT CURSOR GLOW NOS CARDS ---
        const cards = document.querySelectorAll<HTMLElement>('.spotlight-card, .gsap-card');
        cards.forEach((card) => {
          const handleMouseMove = throttle((e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
          });
          card.addEventListener('mousemove', handleMouseMove);
        });

        // --- 2. HERO TILT 3D COM PERSPECTIVA ---
        const heroContainer = document.querySelector<HTMLElement>('.gsap-hero-container');
        const hero3D = document.querySelector<HTMLElement>('.gsap-hero-3d');
        if (heroContainer && hero3D && !reducedMotion) {
          const handleMouseMove = throttle((e: MouseEvent) => {
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

          heroContainer.addEventListener('mousemove', handleMouseMove);
          heroContainer.addEventListener('mouseleave', () => {
            gsap.to(hero3D, {
              rotationX: 0,
              rotationY: 0,
              duration: 0.8,
              ease: 'power2.out',
            });
          });
        }

        // --- 3. ATRAÇÃO MAGNÉTICA NOS BOTÕES CTA ---
        const magneticBtns = document.querySelectorAll<HTMLElement>('.gsap-btn-magnetic, .gsap-btn');
        magneticBtns.forEach((btn) => {
          if (reducedMotion) return;

          const handleMouseMove = throttle((e: MouseEvent) => {
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

          btn.addEventListener('mousemove', handleMouseMove);
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

        // --- 4. SCANNER LASER PERICIAL NO PREVIEW DO PDF ---
        const scanLines = document.querySelectorAll('.pdf-scan-line');
        if (scanLines.length > 0 && !reducedMotion) {
          gsap.to(scanLines, {
            top: '98%',
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        }

        // --- 5. SCROLLTRIGGER STAGGER ENTRADA DE CARDS ---
        if (!reducedMotion) {
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
        }

        // --- 6. CONTADORES NUMÉRICOS DE PERFORMANCE ---
        const counters = document.querySelectorAll('.gsap-counter');
        counters.forEach((counter) => {
          const targetVal = parseFloat(counter.getAttribute('data-target') || '100');
          const suffix = counter.getAttribute('data-suffix') || '';
          const obj = { val: 0 };

          gsap.to(obj, {
            val: targetVal,
            duration: reducedMotion ? 0 : 1.6,
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

        // --- 7. AMBIENT BACKGROUND GLOW ORBS ---
        if (!reducedMotion) {
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
            x: '+=35',
            duration: 8,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
        }

        // --- REVELAÇÕES ADICIONAIS DE HERO E TÍTULOS ---
        if (!reducedMotion) {
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
        }

        // --- 8. ENTRADA DO HEADER ---
        if (!reducedMotion) {
          gsap.from('.gsap-header-item', {
            opacity: 0,
            y: -14,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power3.out',
          });
        }

        // --- 9. PROFUNDIDADE NO MOBILE ---
        const depthMM = gsap.matchMedia();
        depthMM.add('(max-width: 767px)', () => {
          gsap.utils.toArray<HTMLElement>('.gsap-depth-item').forEach((el) => {
            gsap.from(el, {
              opacity: 0,
              y: reducedMotion ? 0 : 24,
              rotationX: reducedMotion ? 0 : 8,
              transformPerspective: 800,
              duration: reducedMotion ? 0 : 0.7,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 88%',
                toggleActions: 'play none none reverse',
              },
            });
          });
        });

        // --- 10. ANIMA��������ES INTERATIVAS PARA BADGES ---
        if (!reducedMotion) {
          const badges = document.querySelectorAll<HTMLElement>('.brand-badge, .tag-framework, .badge');
          badges.forEach((badge) => {
            badge.addEventListener('mouseenter', () => {
              gsap.to(badge, {
                scale: 1.1,
                rotation: 2,
                duration: 0.3,
                ease: 'power2.out',
              });
            });
            
            badge.addEventListener('mouseleave', () => {
              gsap.to(badge, {
                scale: 1,
                rotation: 0,
                duration: 0.3,
                ease: 'power2.out',
              });
            });
          });
        }

        // --- 11. ANIMA��������ES INTERATIVAS PARA CART��������ES ---
        if (!reducedMotion) {
          const interactiveCards = document.querySelectorAll<HTMLElement>('.defesa-card, .espectro-card, .card:not(.gsap-card):not(.spotlight-card)');
          interactiveCards.forEach((card) => {
            card.addEventListener('mouseenter', () => {
              gsap.to(card, {
                y: -4,
                scale: 1.02,
                duration: 0.4,
                ease: 'power2.out',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
              });
            });
            
            card.addEventListener('mouseleave', () => {
              gsap.to(card, {
                y: 0,
                scale: 1,
                duration: 0.4,
                ease: 'power2.out',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              });
            });
          });
        }

        // --- 12. ANIMA��������ES INTERATIVAS PARA LINKS ---
        if (!reducedMotion) {
          const interactiveLinks = document.querySelectorAll<HTMLElement>('a:not(.gsap-header-item):not(.LandingCtaLink):not([href*="/demo"]):not([href*="#"])');
          interactiveLinks.forEach((link) => {
            link.addEventListener('mouseenter', () => {
              gsap.to(link, {
                x: 2,
                duration: 0.2,
                ease: 'power2.out',
              });
            });
            
            link.addEventListener('mouseleave', () => {
              gsap.to(link, {
                x: 0,
                duration: 0.2,
                ease: 'power2.out',
              });
            });
          });
        }

        // --- 13. ANIMA��������ES INTERATIVAS PARA LINHAS DE TABELA ---
        if (!reducedMotion) {
          const tableRows = document.querySelectorAll<HTMLElement>('table.wireframe-table tbody tr');
          tableRows.forEach((row) => {
            row.addEventListener('mouseenter', () => {
              gsap.to(row, {
                backgroundColor: '#faf8f5',
                duration: 0.3,
                ease: 'power2.out',
              });
            });
            
            row.addEventListener('mouseleave', () => {
              gsap.to(row, {
                backgroundColor: 'transparent',
                duration: 0.3,
                ease: 'power2.out',
              });
            });
          });
        }

        // --- 14. FOCO INTERATIVO PARA INPUTS (quando presentes) ---
        if (!reducedMotion) {
          const interactiveInputs = document.querySelectorAll<HTMLElement>('input, select, textarea');
          interactiveInputs.forEach((input) => {
            input.addEventListener('focus', () => {
              gsap.to(input, {
                borderColor: 'var(--processing)',
                boxShadow: '0 0 0 3px rgba(237,137,54,0.2)',
                duration: 0.3,
                ease: 'power2.out',
              });
            });
            
            input.addEventListener('blur', () => {
              gsap.to(input, {
                borderColor: '',
                boxShadow: '',
                duration: 0.3,
                ease: 'power2.out',
              });
            });
          });
        }

        // Refresh ScrollTrigger após boot para recalcular posições
        ScrollTrigger.refresh();
      });

      return () => ctx.revert();
    }

    let cancelled = false;

    function init() {
      if (cancelled) return;
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(boot, { timeout: 3000 });
      } else {
        setTimeout(boot, 3000);
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, []);
}
