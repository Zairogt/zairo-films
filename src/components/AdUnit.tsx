import { useEffect, useRef } from 'react'

interface AdUnitProps {
  slot: string
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical'
  style?: React.CSSProperties
  className?: string
}

const IS_DEV = import.meta.env.DEV

// Alturas aproximadas por formato para el placeholder de desarrollo
const PLACEHOLDER_HEIGHT: Record<string, number> = {
  rectangle: 250,
  horizontal: 90,
  vertical: 600,
  fluid: 200,
  auto: 90,
}

export default function AdUnit({ slot, format = 'auto', style, className }: AdUnitProps) {
  const ref = useRef<HTMLModElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (IS_DEV) return          // no llamar adsbygoogle en dev
    if (pushed.current) return
    pushed.current = true
    try {
      ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
      ;(window as any).adsbygoogle.push({})
    } catch {}
  }, [])

  // En desarrollo: placeholder visible con las proporciones correctas
  if (IS_DEV) {
    const h = (style?.height as number | undefined) ?? PLACEHOLDER_HEIGHT[format] ?? 90
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: style?.width ?? '100%',
          height: h,
          background: '#0e0e0e',
          border: '1px dashed rgba(255,255,255,0.08)',
          ...style,
        }}
      >
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '9px',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#2e2b26',
        }}>
          AdSense · {slot} · {format}
        </span>
      </div>
    )
  }

  // En producción: unidad real de AdSense
  return (
    <ins
      ref={ref}
      className={`adsbygoogle${className ? ` ${className}` : ''}`}
      style={{ display: 'block', minHeight: 0, ...style }}
      data-ad-client="ca-pub-2016231976367603"
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  )
}
