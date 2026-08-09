'use client'
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { buttonVariants, type ButtonSize, type ButtonVariant } from './buttonVariants'

/**
 * Sistema de botão do design system — fonte ÚNICA de estilo.
 *
 * `buttonVariants()` vive em `./buttonVariants` (sem 'use client') para
 * poder ser usado também em Server Components.
 *
 * Papéis de cor seguem a governança do globals.css:
 *   primary  = ação interativa (azul --primary)
 *   secondary= ação de apoio (tokens --btn-secondary-*)
 *   ghost    = ação terciária (só texto)
 *   success  = confirmação/conclusão (verde; semântica própria, igual ao WhatsApp/sucesso do app)
 * Raio = --radius-control (rounded-xl).
 */

export type { ButtonVariant, ButtonSize }
export { buttonVariants }

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
