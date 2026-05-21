interface LogoProps {
  variant?: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 24, md: 32, lg: 40 }
const textSizes = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' }

export function LogoIcon({ variant = 'light', size = 'md' }: LogoProps) {
  const px = sizes[size]
  const color = variant === 'light' ? '#FFFFFF' : '#E63946'
  return (
    <svg width={px} height={px} viewBox="0 0 32 32" fill="none">
      <circle cx="10" cy="16" r="7" stroke={color} strokeWidth="2.5" fill="none" />
      <circle cx="22" cy="16" r="7" stroke={color} strokeWidth="2.5" fill="none" />
      <path d="M13 16 Q16 11 19 16 Q16 21 13 16Z" fill={color} />
    </svg>
  )
}

export function LogoFull({ variant = 'light', size = 'md' }: LogoProps) {
  const textColor = variant === 'light' ? 'text-white' : 'text-[#0C1426]'
  const accentColor = variant === 'light' ? 'text-[#E63946]' : 'text-[#E63946]'
  return (
    <div className="flex items-center gap-2.5">
      <LogoIcon variant={variant} size={size} />
      <span className={`font-display font-bold tracking-tight ${textSizes[size]} ${textColor}`}>
        Sino<span className={accentColor}>Link</span>
      </span>
    </div>
  )
}
