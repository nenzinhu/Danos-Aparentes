'use client';
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function useGsapScrollAnimations() {
  useEffect(() => {
    // 1. Registra o ScrollTrigger no GSAP
    gsap.registerPlugin(ScrollTrigger);

    // Contexto para limpeza automática (evita vazamentos em re-renders)
    const ctx = gsap.context(() => {
      // --- HERO SECTION: Fade-in + Stagger ---
      gsap.from('.gsap-hero-item', {
        opacity: 0,
        y: 40,
        duration: 1,
        stagger: 0.18,
        ease: 'power3.out',
      });

      // --- HERO PARALLAX ---
      gsap.to('.gsap-hero-parallax', {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: '.gsap-hero-container',
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // --- RECURSOS / BENEFÍCIOS: Revelação de Cards com Stagger ---
      gsap.from('.gsap-card', {
        opacity: 0,
        y: 50,
        scale: 0.95,
        duration: 0.8,
        stagger: 0.15,
        ease: 'back.out(1.4)',
        scrollTrigger: {
          trigger: '.gsap-cards-container',
          start: 'top 82%',
          toggleActions: 'play none none reverse',
        },
      });

      // --- CONTADORES NUMÉRICOS ANIMADOS ---
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

      // --- SEÇÃO DE SEGURANÇA: Glow / Pulso Contínuo ---
      gsap.to('.gsap-glow-badge', {
        scale: 1.06,
        boxShadow: '0 0 35px rgba(56, 189, 248, 0.5)',
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // --- MICROINTERAÇÃO NOS BOTÕES CTA ---
      const ctaButtons = document.querySelectorAll('.gsap-btn');
      ctaButtons.forEach((btn) => {
        btn.addEventListener('mouseenter', () => {
          gsap.to(btn, { scale: 1.04, duration: 0.25, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { scale: 1, duration: 0.25, ease: 'power2.out' });
        });
      });
    });

    return () => {
      ctx.revert();
    };
  }, []);
}
