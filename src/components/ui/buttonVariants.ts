/**
 * Variantes de botão — puro (sem 'use client').
 * Pode ser importado em Server Components e Client Components.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'success'
export type ButtonSize = 'auto' | 'sm' | 'md' | 'lg'
export type ButtonAlign = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'

const BASE =
  'inline-flex items-center justify-center gap-2 font-bold rounded-xl select-none ' +
  'transition-[transform,background-color,box-shadow,color] duration-200 ease-out ' +
  'outline-none focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] ' +
  'active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none aria-disabled:opacity-60 aria-disabled:pointer-events-none ' +
  'motion-reduce:transition-none'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-[var(--primary)]/20 ' +
    'motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-xl',
  secondary:
    'bg-transparent border border-[var(--btn-secondary-border)] ' +
    'hover:bg-[var(--btn-secondary-hover)] text-[var(--text-main)]',
  ghost:
    'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/[0.04] ' +
    'px-2',
  success:
    'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/15 ' +
    'motion-safe:hover:-translate-y-0.5 focus-visible:ring-green-500',
}

const SIZES: Record<ButtonSize, string> = {
  auto: 'px-3 py-2 text-sm whitespace-nowrap',
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

const ALIGN_MAP: Record<ButtonAlign, string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly',
}

export function buttonVariants(opts?: {
  variant?: ButtonVariant
  size?: ButtonSize
  align?: ButtonAlign
  fullWidth?: boolean
  className?: string
}): string {
  const { variant = 'primary', size = 'md', align, fullWidth, className = '' } = opts ?? {}
  const classes = [BASE, VARIANTS[variant], SIZES[size]]
  if (align) classes.push(ALIGN_MAP[align])
  if (fullWidth) classes.push('w-full')
  classes.push(className)
  return classes.filter(Boolean).join(' ')
}
