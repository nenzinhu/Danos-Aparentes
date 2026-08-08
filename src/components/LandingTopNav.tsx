'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { gsap } from 'gsap'

type NavLeaf = {
  href: string
  label: string
  blurb?: string
}

type NavGroup = {
  id: string
  label: string
  blurb?: string
  items: Array<NavLeaf | { id: string; label: string; blurb?: string; children: NavLeaf[] }>
}

const NAV: NavGroup[] = [
  {
    id: 'produto',
    label: 'Plataforma',
    blurb: 'Inteligência Histórica Veicular',
    items: [
      {
        href: '/historico',
        label: 'Histórico Inteligente',
        blurb: 'Memória digital permanente',
      },
      {
        href: '/historico-de-frotas',
        label: 'Gestão de Frota',
        blurb: 'Linha do tempo em escala',
      },
      { href: '/demo', label: 'Solicitar Demonstração', blurb: 'Conheça a plataforma' },
      { href: '/verify', label: 'Dossiês', blurb: 'Verificar autenticidade do PDF' },
      { href: '/depoimentos', label: 'Depoimentos', blurb: 'Quem usa conta o resultado' },
      { href: '/planos', label: 'Planos', blurb: 'Starter, Pro e Corporativo' },
    ],
  },
  {
    id: 'segmentos',
    label: 'Segmentos',
    blurb: 'A mesma plataforma, a dor do seu ICP',
    items: [
      { href: '/locadoras', label: 'Para Locadoras', blurb: 'Retirada × devolução' },
      { href: '/oficinas', label: 'Para Oficinas', blurb: 'Entrada × saída' },
      { href: '/seguradoras', label: 'Para Seguradoras', blurb: 'QR anti-fraude' },
      { href: '/frotas', label: 'Para Frotas', blurb: 'Offline no pátio' },
    ],
  },
  {
    id: 'conteudo',
    label: 'Conteúdo',
    blurb: 'Aprenda e tire dúvidas',
    items: [
      { href: '/blog', label: 'Guias de histórico veicular', blurb: 'Artigos práticos do pátio' },
      { href: '/faq', label: 'FAQ', blurb: 'Preço, offline, hash e mais' },
    ],
  },
  {
    id: 'empresa',
    label: 'Empresa',
    blurb: 'Quem somos e suporte',
    items: [
      { href: '/sobre', label: 'Sobre', blurb: 'Inteligência Histórica e IA' },
      { href: '/suporte', label: 'Suporte', blurb: 'Fale com o time' },
      {
        id: 'legal',
        label: 'Legal',
        blurb: 'Políticas e termos',
        children: [
          { href: '/privacidade', label: 'Privacidade', blurb: 'LGPD e dados' },
          { href: '/termos', label: 'Termos de Uso', blurb: 'Condições do serviço' },
        ],
      },
    ],
  },
]

function isLeaf(item: NavGroup['items'][number]): item is NavLeaf {
  return 'href' in item
}

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function animateOpen(panel: HTMLElement, items: HTMLElement[]) {
  if (prefersReducedMotion()) {
    gsap.set(panel, { autoAlpha: 1, y: 0, x: 0 })
    gsap.set(items, { autoAlpha: 1, y: 0 })
    return
  }
  gsap.killTweensOf([panel, ...items])
  gsap.fromTo(
    panel,
    { autoAlpha: 0, y: 8, scale: 0.98 },
    { autoAlpha: 1, y: 0, scale: 1, duration: 0.28, ease: 'power2.out' },
  )
  gsap.fromTo(
    items,
    { autoAlpha: 0, y: 10 },
    { autoAlpha: 1, y: 0, duration: 0.32, stagger: 0.045, ease: 'power2.out', delay: 0.04 },
  )
}

function animateCascade(panel: HTMLElement, items: HTMLElement[]) {
  if (prefersReducedMotion()) {
    gsap.set(panel, { autoAlpha: 1, x: 0 })
    gsap.set(items, { autoAlpha: 1, x: 0 })
    return
  }
  gsap.killTweensOf([panel, ...items])
  gsap.fromTo(
    panel,
    { autoAlpha: 0, x: -10 },
    { autoAlpha: 1, x: 0, duration: 0.26, ease: 'power2.out' },
  )
  gsap.fromTo(
    items,
    { autoAlpha: 0, x: -8 },
    { autoAlpha: 1, x: 0, duration: 0.28, stagger: 0.04, ease: 'power2.out', delay: 0.03 },
  )
}

export default function LandingTopNav() {
  const uid = useId()
  const rootRef = useRef<HTMLElement>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [cascadeId, setCascadeId] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const cascadeRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const closeAll = useCallback(() => {
    setOpenId(null)
    setCascadeId(null)
  }, [])

  useEffect(() => {
    if (!openId) return
    const panel = panelRefs.current[openId]
    if (!panel) return
    const items = Array.from(panel.querySelectorAll<HTMLElement>('[data-nav-item]'))
    animateOpen(panel, items)
  }, [openId])

  useEffect(() => {
    if (!cascadeId) return
    const panel = cascadeRefs.current[cascadeId]
    if (!panel) return
    const items = Array.from(panel.querySelectorAll<HTMLElement>('[data-nav-item]'))
    animateCascade(panel, items)
  }, [cascadeId])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeAll()
        setMobileOpen(false)
      }
    }
    function onPointer(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) closeAll()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer)
    }
  }, [closeAll])

  useEffect(() => {
    if (!mobileOpen) return
    const drawer = document.querySelector<HTMLElement>('[data-mobile-drawer]')
    if (!drawer) return
    const items = Array.from(drawer.querySelectorAll<HTMLElement>('[data-mobile-item]'))
    animateOpen(drawer, items)
  }, [mobileOpen])

  // Trava o scroll do body enquanto o drawer mobile está aberto
  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  return (
    <nav ref={rootRef} className="gsap-header-item relative flex items-center" aria-label="Navegação principal">
      {/* Desktop */}
      <ul className="desktop-nav hidden lg:flex items-center gap-1">
        {NAV.map(group => {
          const expanded = openId === group.id
          return (
            <li
              key={group.id}
              className="relative"
              onMouseEnter={() => {
                setOpenId(group.id)
                setCascadeId(null)
              }}
              onMouseLeave={() => {
                setOpenId(null)
                setCascadeId(null)
              }}
            >
              <button
                type="button"
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-semibold transition-colors outline-none cursor-pointer ${
                  expanded
                    ? 'text-[var(--text-main)] bg-[var(--btn-secondary-bg)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
                aria-expanded={expanded}
                aria-haspopup="true"
                aria-controls={`${uid}-${group.id}`}
                onClick={() => setOpenId(expanded ? null : group.id)}
              >
                {group.label}
                <span aria-hidden="true" className={`text-[10px] transition-transform ${expanded ? 'rotate-180' : ''}`}>
                  ▾
                </span>
              </button>

              {expanded && (
                <div
                  id={`${uid}-${group.id}`}
                  ref={el => {
                    panelRefs.current[group.id] = el
                  }}
                  role="menu"
                  className="absolute left-0 top-full pt-2 z-[60]"
                >
                  <div className="min-w-[260px] rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)]/95 backdrop-blur-xl shadow-2xl shadow-black/30 p-2">
                    {group.blurb && (
                      <p className="px-3 pt-2 pb-1 font-mono-data text-[9px] uppercase tracking-[0.16em] text-[var(--signal-bright)]">
                        {group.blurb}
                      </p>
                    )}
                    <ul className="flex flex-col gap-0.5">
                      {group.items.map(item => {
                        if (isLeaf(item)) {
                          const isLaudos = item.href === '/verify'
                          return (
                            <li key={item.href} data-nav-item role="none">
                              <Link
                                href={item.href}
                                role="menuitem"
                                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-[var(--btn-secondary-hover)] transition-colors"
                                onClick={closeAll}
                              >
                                {isLaudos && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src="/icons/laudos-verify.svg"
                                    alt=""
                                    width={28}
                                    height={28}
                                    className="h-6 w-6 shrink-0"
                                    aria-hidden
                                  />
                                )}
                                <span className="min-w-0">
                                  <span className="block text-sm font-bold text-[var(--text-main)]">{item.label}</span>
                                  {item.blurb && (
                                    <span className="block text-[11px] text-[var(--text-muted)] mt-0.5 leading-snug">
                                      {item.blurb}
                                    </span>
                                  )}
                                </span>
                              </Link>
                            </li>
                          )
                        }

                        const cascadeOpen = cascadeId === item.id
                        return (
                          <li
                            key={item.id}
                            data-nav-item
                            role="none"
                            className="relative"
                            onMouseEnter={() => setCascadeId(item.id)}
                          >
                            <button
                              type="button"
                              role="menuitem"
                              aria-haspopup="true"
                              aria-expanded={cascadeOpen}
                              className={`w-full text-left rounded-xl px-3 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                                cascadeOpen ? 'bg-[var(--btn-secondary-hover)]' : 'hover:bg-[var(--btn-secondary-hover)]'
                              }`}
                              onClick={() => setCascadeId(cascadeOpen ? null : item.id)}
                            >
                              <span>
                                <span className="block text-sm font-bold text-[var(--text-main)]">{item.label}</span>
                                {item.blurb && (
                                  <span className="block text-[11px] text-[var(--text-muted)] mt-0.5">{item.blurb}</span>
                                )}
                              </span>
                              <span aria-hidden="true" className="text-[var(--signal-bright)] text-xs">
                                ▸
                              </span>
                            </button>

                            {cascadeOpen && (
                              <div
                                ref={el => {
                                  cascadeRefs.current[item.id] = el
                                }}
                                role="menu"
                                className="absolute left-full top-0 ml-1.5 min-w-[220px] rounded-2xl border border-[var(--card-border)] bg-[var(--panel-bg)]/95 backdrop-blur-xl shadow-2xl shadow-black/30 p-2"
                              >
                                {item.children.map(child => (
                                  <div key={child.href} data-nav-item>
                                    <Link
                                      href={child.href}
                                      role="menuitem"
                                      className="block rounded-xl px-3 py-2.5 hover:bg-[var(--btn-secondary-hover)] transition-colors"
                                      onClick={closeAll}
                                    >
                                      <span className="block text-sm font-bold text-[var(--text-main)]">{child.label}</span>
                                      {child.blurb && (
                                        <span className="block text-[11px] text-[var(--text-muted)] mt-0.5">
                                          {child.blurb}
                                        </span>
                                      )}
                                    </Link>
                                  </div>
                                ))}
                              </div>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      {/* Mobile trigger — botão só-ícone para não espremer o logo/Dossiês no header */}
      <button
        type="button"
        className="lg:hidden inline-flex items-center justify-center h-10 w-10 shrink-0 rounded-xl border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] text-[var(--text-main)] cursor-pointer"
        aria-expanded={mobileOpen}
        aria-controls={`${uid}-mobile`}
        aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
        onClick={() => {
          setMobileOpen(o => !o)
          closeAll()
        }}
      >
        {/* Estado via CLASSE, não via [data-open='true']: o minificador do build
            remove as aspas e o seletor passa a casar com o menu fechado. */}
        <span className={`mobile-burger${mobileOpen ? ' is-open' : ''}`} aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[9999]" role="dialog" aria-modal="true" aria-label="Menu">
          {/* Backdrop translúcido: isola o conteúdo e fecha ao clicar fora */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div
            id={`${uid}-mobile`}
            data-mobile-drawer
            className="mobile-menu-dropdown absolute right-0 top-0 h-full w-[min(86vw,360px)] flex flex-col border-l border-[var(--card-border)] shadow-2xl p-3 overflow-y-auto"
          >
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Fechar menu"
                className="px-3 py-1.5 rounded-lg border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] text-sm font-bold text-[var(--text-main)] cursor-pointer"
              >
                ✕
              </button>
            </div>
            {NAV.map(group => (
              <div key={group.id} data-mobile-item className="mb-3 last:mb-0">
                <p className="px-2 pt-1 pb-1.5 font-mono-data text-[9px] uppercase tracking-[0.16em] text-[var(--signal-bright)]">
                  {group.label}
                  {group.blurb ? ` · ${group.blurb}` : ''}
                </p>
                <ul className="flex flex-col gap-0.5">
                  {group.items.map(item => {
                    if (isLeaf(item)) {
                      const isLaudos = item.href === '/verify'
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 hover:bg-[var(--btn-secondary-hover)]"
                            onClick={() => setMobileOpen(false)}
                          >
                            {isLaudos && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src="/icons/laudos-verify.svg"
                                alt=""
                                width={24}
                                height={24}
                                className="h-5 w-5 shrink-0"
                                aria-hidden
                              />
                            )}
                            <span className="min-w-0">
                              <span className="block text-sm font-bold text-[var(--text-main)]">{item.label}</span>
                              {item.blurb && (
                                <span className="block text-[11px] text-[var(--text-muted)] mt-0.5">{item.blurb}</span>
                              )}
                            </span>
                          </Link>
                        </li>
                      )
                    }
                    return (
                      <li key={item.id} className="rounded-xl border border-[var(--card-border)]/50 overflow-hidden">
                        <p className="px-3 py-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                          {item.label}
                        </p>
                        {item.children.map(child => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-3 py-2.5 border-t border-[var(--card-border)]/40 hover:bg-[var(--btn-secondary-hover)]"
                            onClick={() => setMobileOpen(false)}
                          >
                            <span className="block text-sm font-bold text-[var(--text-main)]">{child.label}</span>
                            {child.blurb && (
                              <span className="block text-[11px] text-[var(--text-muted)] mt-0.5">{child.blurb}</span>
                            )}
                          </Link>
                        ))}
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
