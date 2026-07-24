'use client';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

/**
 * Sistema de botão do design system — fonte ÚNICA de estilo.
 *
 * `buttonVariants()` devolve as classes e pode ser consumido por qualquer
 * elemento (um <button>, um <a>, o LandingCtaLink), garantindo que ação,
 * tamanho, foco e estados fiquem idênticos em toda a aplicação.
 *
 * Papéis de cor seguem a governança do globals.css:
 *   primary  = ação interativa (azul --primary)
 *   secondary= ação de apoio (tokens --btn-secondary-*)
 *   ghost    = ação terciária (só texto)
 *   success  = confirmação/conclusão (verde; semântica própria, igual ao WhatsApp/sucesso do app)
 * Raio = --radius-control (rounded-xl).
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'success'
export type ButtonSize = 'sm' | 'md' | 'lg'

const BASE =
  'inline-flex items-center justify-center gap-2 font-bold rounded-xl select-none ' +
  'transition-[transform,background-color,box-shadow,color] duration-200 ease-out ' +
  'outline-none focus-visible:ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--bg-main)] ' +
  'active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none aria-disabled:opacity-60 aria-disabled:pointer-events-none ' +
  'motion-reduce:transition-none'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-primary hover:bg-primary-hover text-white shadow-xl shadow-[var(--primary)]/15 ' +
    'motion-safe:hover:-translate-y-0.5',
  secondary:
    'bg-[var(--btn-secondary-bg)] border border-[var(--btn-secondary-border)] ' +
    'hover:bg-[var(--btn-secondary-hover)] text-[var(--text-main)]',
  ghost: 'text-[var(--text-muted)] hover:text-[var(--text-main)]',
  success:
    'bg-green-600 hover:bg-green-500 text-white shadow-xl shadow-green-600/15 ' +
    'motion-safe:hover:-translate-y-0.5 focus-visible:ring-green-500',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

export function buttonVariants(opts?: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}): string {
  const { variant = 'primary', size = 'md', className = '' } = opts ?? {}
  return [BASE, VARIANTS[variant], SIZES[size], className].filter(Boolean).join(' ')
}

function Spinner() {
  return (
    <svg className="animate-spin motion-reduce:animate-none" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonVariants({ variant, size, className })}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
})

export default Button
