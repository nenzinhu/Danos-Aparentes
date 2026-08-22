'use client'
import { useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'

type NavigationDirection = 'forward' | 'back' | 'none'

const BACK_PATHS = new Set([
  '/app',
  '/app/',
  '/planos',
  '/historico',
  '/historico-de-frotas',
  '/verify',
  '/blog',
])

function guessDirection(pathname: string, target: string): NavigationDirection {
  if (target === pathname) return 'none'
  if (target === '/app' && pathname !== '/app') return 'forward'
  if (pathname.startsWith('/app/') && target === '/app') return 'back'
  if (BACK_PATHS.has(target) && !pathname.startsWith('/app')) return 'forward'
  return 'none'
}

export function useDirectionalLink() {
  const router = useRouter()
  const pathname = usePathname()

  const navigate = useCallback(
    (href: string, direction: NavigationDirection = 'none') => {
      const transitionTypes = direction === 'none' ? undefined : [direction === 'forward' ? 'nav-forward' : 'nav-back']
      router.push(href, { scroll: false } as never)
    },
    [router],
  )

  const linkProps = useCallback(
    (href: string, direction: NavigationDirection = 'none') => {
      const transitionTypes = direction === 'none' ? undefined : [direction === 'forward' ? 'nav-forward' : 'nav-back']
      return {
        href,
        transitionTypes: transitionTypes as never,
      }
    },
    [],
  )

  const prefetch = useCallback((href: string) => {
    try { router.prefetch(href) } catch {}
  }, [router])

  return { pathname, navigate, linkProps, prefetch, guessDirection }
}
