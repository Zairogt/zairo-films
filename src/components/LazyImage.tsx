import { useState } from 'react'

interface Props {
  src: string
  alt: string
  style?: React.CSSProperties
  className?: string
}

export default function LazyImage({ src, alt, style, className }: Props) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div style={{ position: 'relative', width: '100%', lineHeight: 0 }}>
      {/* Shimmer mientras no carga */}
      {!loaded && (
        <div
          className="shimmer"
          style={{
            position: 'absolute',
            inset: 0,
            aspectRatio: '16/9',
          }}
        />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={className}
        onLoad={() => setLoaded(true)}
        style={{
          ...style,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      />
    </div>
  )
}
