'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

/* ------------------------------------------------------------------ *
 * Tabs — sistema genérico de abas (a11y, mobile-first, sem dependência)
 * Segue: role=tablist / tab / tabpanel, roving tabindex, indicador CSS.
 * ------------------------------------------------------------------ */

interface TabsContextValue {
  baseId: string
  value: string
  setValue: (v: string) => void
  registerTab: (value: string, el: HTMLButtonElement | null) => void
  tabs: string[]
  orientation: 'horizontal' | 'vertical'
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext(): TabsContextValue {
  const ctx = useContext(TabsContext)
  if (!ctx) throw new Error('Tab/TabPanel deve ser usado dentro de <Tabs>')
  return ctx
}

/** Calcula o próximo índice de aba para navegação por teclado (roving tabindex). */
export function getNextTabIndex(
  key: string,
  current: number,
  length: number,
  orientation: 'horizontal' | 'vertical' = 'horizontal',
): number {
  if (length === 0) return -1
  const nextKeys = orientation === 'vertical' ? ['ArrowDown'] : ['ArrowRight']
  const prevKeys = orientation === 'vertical' ? ['ArrowUp'] : ['ArrowLeft']
  if (nextKeys.includes(key)) return (current + 1) % length
  if (prevKeys.includes(key)) return (current - 1 + length) % length
  if (key === 'Home') return 0
  if (key === 'End') return length - 1
  return -1
}

export interface TabsProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  children: React.ReactNode
  className?: string
}

export function Tabs({
  value: controlled,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  children,
  className,
}: TabsProps) {
  const baseId = useId()
  const [internal, setInternal] = useState<string>(defaultValue ?? '')
  const isControlled = controlled !== undefined
  const value = isControlled ? controlled : internal
  const tabEls = useRef<Map<string, HTMLButtonElement>>(new Map())
  const [tabs, setTabs] = useState<string[]>([])

  const setValue = useCallback((v: string) => {
    if (!isControlled) setInternal(v)
    onValueChange?.(v)
  }, [isControlled, onValueChange])

  const registerTab = useCallback((v: string, el: HTMLButtonElement | null) => {
    if (el) {
      tabEls.current.set(v, el)
      setTabs((prev) => (prev.includes(v) ? prev : [...prev, v]))
    } else {
      tabEls.current.delete(v)
      setTabs((prev) => prev.filter((t) => t !== v))
    }
  }, [])

  const ctx = useMemo<TabsContextValue>(
    () => ({ baseId, value, setValue, registerTab, tabs, orientation }),
    [baseId, value, setValue, tabs, orientation, registerTab],
  )

  return (
    <TabsContext.Provider value={ctx}>
      <div className={className} data-tabs-root="">
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export interface TabsListProps {
  'aria-label': string
  children: React.ReactNode
  className?: string
}

export function TabsList({ 'aria-label': ariaLabel, children, className }: TabsListProps) {
  const { value, tabs, orientation } = useTabsContext()
  const listRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)

  // Indicador deslizante: posiciona sob a aba ativa via transform+width.
  useLayoutEffect(() => {
    const active = listRef.current?.querySelector<HTMLButtonElement>('[data-tab-active="true"]')
    const indicator = indicatorRef.current
    if (!active || !indicator || !listRef.current) return
    const listRect = listRef.current.getBoundingClientRect()
    const rect = active.getBoundingClientRect()
    const inset = orientation === 'horizontal' ? rect.left - listRect.left : rect.top - listRect.top
    const size = orientation === 'horizontal' ? rect.width : rect.height
    if (orientation === 'horizontal') {
      indicator.style.transform = `translateX(${inset}px)`
      indicator.style.width = `${size}px`
      indicator.style.height = ''
      indicator.style.transform += ` translateY(0)`
    } else {
      indicator.style.transform = `translateY(${inset}px)`
      indicator.style.height = `${size}px`
      indicator.style.width = ''
    }
  }, [value, tabs, orientation])

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = tabs
    const idx = items.indexOf(value)
    if (idx < 0) return
    const next = getNextTabIndex(e.key, idx, items.length, orientation)
    if (next < 0) return
    e.preventDefault()
    const nextVal = items[next]
    const el = listRef.current?.querySelector<HTMLButtonElement>(`[data-tab-value="${nextVal}"]`)
    el?.focus()
  }

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation={orientation}
      onKeyDown={onKeyDown}
      className={
        'theme-tabs relative bg-[var(--card-bg-solid)] border border-[var(--card-border)] rounded-xl p-1 flex items-center gap-0.5 shadow-sm backdrop-blur-md w-full lg:w-auto max-w-full overflow-x-auto no-scrollbar lg:overflow-visible lg:flex-wrap scroll-smooth ' +
        (orientation === 'vertical' ? 'flex-col items-stretch' : 'justify-start lg:justify-center') +
        (className ? ' ' + className : '')
      }
    >
      {children}
      <span
        ref={indicatorRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-1 top-1 bottom-1 rounded-lg bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] border border-[color-mix(in_srgb,var(--primary)_28%,transparent)] opacity-90 transition-[transform,width,height] duration-200 ease-out motion-reduce:transition-none"
      />
    </div>
  )
}

export interface TabProps {
  value: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export function Tab({ value, children, className, disabled }: TabProps) {
  const { value: active, setValue, registerTab, baseId } = useTabsContext()
  const ref = useRef<HTMLButtonElement>(null)
  const isActive = active === value

  useLayoutEffect(() => {
    registerTab(value, ref.current)
    return () => registerTab(value, null)
  }, [value, registerTab])

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={isActive}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={isActive ? 0 : -1}
      data-tab-value={value}
      data-tab-active={isActive}
      disabled={disabled}
      onClick={() => !disabled && setValue(value)}
      className={
        'relative z-10 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold font-outfit transition-colors cursor-pointer border inline-flex items-center gap-1.5 whitespace-nowrap scroll-snap-align-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--card-bg-solid)] disabled:opacity-40 disabled:cursor-not-allowed ' +
        (isActive
          ? 'theme-tab-active text-[var(--primary)] border-transparent font-extrabold'
          : 'theme-tab-idle text-[var(--text-muted)] hover:text-[var(--text-main)] border-transparent hover:bg-white/[0.04]') +
        (className ? ' ' + className : '')
      }
    >
      {children}
    </button>
  )
}

export interface TabPanelProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function TabPanel({ value, children, className }: TabPanelProps) {
  const { value: active, baseId } = useTabsContext()
  const isActive = active === value
  if (!isActive) return null
  return (
    <div
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      tabIndex={0}
      className={'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] rounded-lg ' + (className ?? '')}
    >
      {children}
    </div>
  )
}
