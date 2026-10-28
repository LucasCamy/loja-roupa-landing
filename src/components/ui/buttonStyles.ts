/** Classes dos botões (variantes × tamanhos), documentadas no DESIGN.md e no /styleguide.html */
export type ButtonVariant = 'primary' | 'secondary' | 'whatsapp' | 'ghost' | 'light'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'group/btn relative inline-flex select-none items-center justify-center gap-2 rounded-full font-semibold leading-none whitespace-nowrap ' +
  'transition-[background-color,color,box-shadow,transform] duration-200 ease-[var(--ease-out)] ' +
  'active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-terracotta-deep text-white shadow-[0_10px_24px_-14px_rgb(158_71_48/0.9)] hover:bg-[#873a26]',
  secondary: 'bg-transparent text-espresso ring-[1.5px] ring-inset ring-espresso/75 hover:bg-espresso hover:text-linen',
  whatsapp: 'bg-whatsapp-green text-white shadow-[0_10px_24px_-14px_rgb(47_107_72/0.9)] hover:bg-[#25573a]',
  ghost: 'bg-transparent text-espresso hover:bg-sand',
  light: 'bg-ivory text-espresso shadow-soft hover:bg-white',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-6 text-[0.95rem]',
  lg: 'h-14 px-7 text-base',
}

export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', extra = '') {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`
}
