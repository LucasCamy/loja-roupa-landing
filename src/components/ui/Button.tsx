import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { buttonClass, type ButtonSize, type ButtonVariant } from './buttonStyles'

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  iconRight?: ReactNode
  children: ReactNode
  className?: string
}

export function Button({ variant = 'primary', size = 'md', icon, iconRight, children, className = '', ...rest }: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={buttonClass(variant, size, className)} {...rest}>
      {icon}
      <span>{children}</span>
      {iconRight}
    </button>
  )
}

export function ButtonLink({ variant = 'primary', size = 'md', icon, iconRight, children, className = '', ...rest }: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  const external = rest.href?.startsWith('http')
  return (
    <a className={buttonClass(variant, size, className)} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
      {icon}
      <span>{children}</span>
      {iconRight}
      {external && <span className="sr-only"> (abre em nova aba)</span>}
    </a>
  )
}
