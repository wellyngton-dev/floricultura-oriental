import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  href?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'light' | 'dark'
  className?: string
  priority?: boolean
}

// ✅ TAMANHOS AUMENTADOS
const sizes = {
  xs: { width: 120, height: 43 },   // Antes: 80x28
  sm: { width: 180, height: 64 },   // Antes: 140x50
  md: { width: 240, height: 85 },   // Antes: 200x71
  lg: { width: 320, height: 114 },  // Antes: 280x100
  xl: { width: 400, height: 142 },  // Antes: 360x128
}

export function Logo({ 
  href, 
  size = 'md', 
  variant = 'light',
  className = '', 
  priority = false 
}: LogoProps) {
  const dimensions = sizes[size]
  
  const logoSrc = variant === 'light' 
    ? '/logo-floricultura-texto-preto.png'
    : '/logo-floricultura-sem-fundo.png'

  const logoContent = (
    <div 
      className={`relative ${className}`} 
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      <Image
        src={logoSrc}
        alt="Floricultura Oriental Vila Nery"
        fill
        className="object-contain"
        priority={priority}
      />
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-80 inline-block">
        {logoContent}
      </Link>
    )
  }

  return logoContent
}
