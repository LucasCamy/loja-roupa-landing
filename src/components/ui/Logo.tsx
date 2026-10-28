export function LogoMark({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path d="M14 52 C14 26 22 12 32 12 C42 12 50 26 50 52" fill="none" stroke="var(--terracotta-deep)" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M22 41 H42" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={30} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.55rem] font-semibold tracking-[0.01em]">Aura Atelier</span>
        <span className="mt-0.5 text-[0.58rem] font-semibold uppercase tracking-[0.22em] text-taupe">Linho autoral</span>
      </span>
    </span>
  )
}
