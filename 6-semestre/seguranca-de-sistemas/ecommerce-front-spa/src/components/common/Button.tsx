import type { ButtonHTMLAttributes } from 'react'
const tones = {
  brand: 'bg-hulk text-primary-900 hover:bg-hulk-light hover:shadow-md',
  add: 'bg-primary-800 text-text-inverse hover:bg-primary-900 hover:shadow-md active:bg-primary-700',
  danger: 'bg-danger-dark text-text-inverse hover:bg-danger hover:shadow-md',
  info: 'border border-info bg-info-light text-info-dark hover:bg-info hover:text-text-inverse',
  neutral: 'border border-border-strong bg-surface text-text-secondary hover:border-primary-600 hover:bg-primary-50 hover:text-primary-900',
} as const
export function Button({ tone = 'add', className = '', type = 'button', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: keyof typeof tones }) {
  return <button type={type} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-600 disabled:pointer-events-none disabled:opacity-45 ${tones[tone]} ${className}`} {...props} />
}
