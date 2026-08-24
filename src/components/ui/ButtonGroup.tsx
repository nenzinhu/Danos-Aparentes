'use client'
import { type ButtonAlign } from './buttonVariants'

interface ButtonGroupProps {
  children: React.ReactNode
  align?: ButtonAlign
  className?: string
}

export function ButtonGroup({ children, align = 'center', className = '' }: ButtonGroupProps) {
  const alignClasses: Record<ButtonAlign, string> = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  }

  return (
    <div className={`flex flex-wrap gap-3 ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  )
}
