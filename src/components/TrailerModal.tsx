import { useEffect } from 'react'

interface Props {
  title: string
  trailerUrl: string
  onClose: () => void
}

export default function TrailerModal({ title, trailerUrl, onClose }: Props) {
  // Cerrar con Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(16px, 4vw, 48px)',
        animation: 'fadeUp 0.3s ease both',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '900px' }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '16px',
        }}>
          <div>
            <span style={{
              fontFamily: 'Inter, sans-serif', fontSize: '9px',
              letterSpacing: '0.25em', textTransform: 'uppercase',
              color: '#c9a227',
            }}>Trailer</span>
            <p style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(16px, 2.5vw, 22px)',
              fontWeight: 300, color: '#e8e3d9', marginTop: '4px',
            }}>{title}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              color: '#6b6560', width: '36px', height: '36px',
              fontSize: '16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s', flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#e8e3d9'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#6b6560'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
          >✕</button>
        </div>

        {/* Línea dorada */}
        <div style={{ height: '1px', background: 'linear-gradient(to right, #c9a227, transparent)', marginBottom: '16px' }} />

        {/* Video */}
        <div style={{
          position: 'relative', paddingBottom: '56.25%',
          background: '#000', overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
        }}>
          <iframe
            src={trailerUrl + '?autoplay=1&rel=0'}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            allow="autoplay; fullscreen"
            title={`Trailer — ${title}`}
          />
        </div>

        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: '10px',
          color: '#3d3a35', textAlign: 'center', marginTop: '16px',
          letterSpacing: '0.1em',
        }}>
          Presiona ESC o haz click fuera para cerrar
        </p>
      </div>
    </div>
  )
}
