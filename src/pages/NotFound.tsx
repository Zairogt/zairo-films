import { useNavigate } from 'react-router-dom'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 30%, #0d0a00 0%, #080808 60%)',
      padding: '24px',
      textAlign: 'center',
    }}>
      {/* Número grande */}
      <div style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: 'clamp(100px, 20vw, 200px)',
        fontWeight: 300,
        lineHeight: 1,
        color: 'transparent',
        WebkitTextStroke: '1px rgba(201,162,39,0.2)',
        letterSpacing: '-0.05em',
        userSelect: 'none',
        marginBottom: '8px',
      }}>
        404
      </div>

      <div style={{ width: '36px', height: '1px', background: '#c9a227', margin: '0 auto 24px' }} />

      <p style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: 'clamp(20px, 3vw, 32px)',
        fontWeight: 300,
        color: '#e8e3d9',
        marginBottom: '10px',
      }}>
        Esta escena no existe
      </p>
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '13px',
        fontWeight: 300,
        color: '#6b6560',
        lineHeight: 1.7,
        maxWidth: '340px',
        marginBottom: '40px',
      }}>
        La página que buscas fue cortada en edición o nunca llegó a filmarse.
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn-primary" onClick={() => navigate('/')}>
          Volver al inicio
        </button>
        <button className="btn-ghost" onClick={() => navigate('/catalogo')}>
          Ver catálogo
        </button>
      </div>
    </div>
  )
}
