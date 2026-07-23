'use client';
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function useGsapScrollAnimations() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {

      // --- HERO: Fade-in + Stagger ---
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

      // --- CARDS (Como Funciona, Trust, etc.) com stagger ---
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

      // --- CONTADORES NUMÉRICOS ---
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

      // --- GLOW BADGE pulsação ---
      gsap.to('.gsap-glow-badge', {
        scale: 1.06,
        boxShadow: '0 0 35px rgba(56, 189, 248, 0.5)',
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // --- MICROINTERAÇÃO NOS CTAs ---
      const ctaButtons = document.querySelectorAll<HTMLElement>('.gsap-btn');
      ctaButtons.forEach((btn) => {
        btn.addEventListener('mouseenter', () => gsap.to(btn, { scale: 1.04, duration: 0.25, ease: 'power2.out' }));
        btn.addEventListener('mouseleave', () => gsap.to(btn, { scale: 1, duration: 0.25, ease: 'power2.out' }));
      });

      // --- SIGNAL DOT: pulso infinito na landing header ---
      gsap.to('.signal-dot', {
        scale: 1.5,
        opacity: 0.3,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.3,
      });

      // --- SHEET FRAME: linhas decorativas fade-in ao scroll ---
      gsap.from('.sheet-frame', {
        opacity: 0,
        y: 30,
        duration: 1.1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: '.sheet-frame',
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      });

      // --- SEÇÕES DE TEXTO: reveal suave de baixo para cima ---
      gsap.utils.toArray<HTMLElement>('.gsap-section-title').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 32,
          duration: 0.85,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        });
      });

      // --- DAMAGE TAGS: entrada com delay escalonado ---
      gsap.from('.damage-tag', {
        opacity: 0,
        x: -8,
        duration: 0.5,
        stagger: 0.15,
        ease: 'power2.out',
        delay: 1.2, // após o hero carregar
      });

    });

    return () => {
      ctx.revert();
    };
  }, []);
}
