import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PENDING_KEY = 'zf_pending_payment'

type Status = 'loading' | 'success' | 'failed' | 'error'

interface PendingPayment {
  movieId: string
  movieTitle: string
  tier: 'watch' | 'download'
  amount: number
  ern: string
}

export default function PagoResultado() {
  const navigate = useNavigate()
  const location = useLocation()
  const { buyMovie } = useAuth()
  const [status, setStatus] = useState<Status>('loading')
  const [pending, setPending] = useState<PendingPayment | null>(null)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    const state = location.state as {
      provider?: 'pagadito' | 'stripe'
      token?: string
      ern?: string
      stripeSession?: string
    } | null

    const provider = state?.provider

    if (provider === 'stripe') {
      const sessionId = state?.stripeSession
      if (!sessionId) { setStatus('error'); return }

      fetch(`/api/verify-stripe-session?session_id=${encodeURIComponent(sessionId)}`)
        .then(r => r.json())
        .then(async data => {
          if (data.status === 'COMPLETED') {
            await buyMovie(data.movieId, data.tier as 'watch' | 'download', data.amount)
            setPending({ movieId: data.movieId, movieTitle: data.movieTitle, tier: data.tier, amount: data.amount, ern: sessionId })
            setStatus('success')
          } else {
            setStatus('failed')
          }
        })
        .catch(() => setStatus('error'))

    } else if (provider === 'pagadito') {
      const token = state?.token
      const saved: PendingPayment | null = (() => {
        try { return JSON.parse(localStorage.getItem(PENDING_KEY) || 'null') } catch { return null }
      })()

      if (!token || !saved) { setStatus('error'); return }
      setPending(saved)

      fetch(`/api/verify-payment?token=${encodeURIComponent(token)}`)
        .then(r => r.json())
        .then(async data => {
          if (data.status === 'COMPLETED') {
            await buyMovie(saved.movieId, saved.tier, saved.amount)
            localStorage.removeItem(PENDING_KEY)
            setStatus('success')
          } else {
            setStatus('failed')
          }
        })
        .catch(() => setStatus('error'))

    } else {
      setStatus('error')
    }
  }, [])

  const base: React.CSSProperties = {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: '#080808', padding: '24px',
  }

  if (status === 'loading') return (
    <div style={base}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          border: '1px solid rgba(201,162,39,0.3)', borderTopColor: '#c9a227',
          margin: '0 auto 32px', animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '22px', fontWeight: 300, fontStyle: 'italic', color: '#6b6560',
        }}>Verificando pago…</p>
      </div>
    </div>
  )

  if (status === 'success') return (
    <div style={{ ...base, background: 'radial-gradient(ellipse at 50% 30%, #0d1a0d 0%, #080808 60%)' }}>
      <div className="anim" style={{ textAlign: 'center', maxWidth: '440px' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          border: '1px solid rgba(201,162,39,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 32px', background: 'rgba(201,162,39,0.06)',
        }}>
          <span style={{ fontSize: '28px', color: '#c9a227' }}>✓</span>
        </div>
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '40px', fontWeight: 300, color: '#e8e3d9', marginBottom: '12px',
        }}>Compra exitosa</h1>
        <div style={{ width: '36px', height: '1px', background: '#c9a227', margin: '0 auto 20px' }} />
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: '13px',
          color: '#6b6560', lineHeight: 1.8, marginBottom: '40px',
        }}>
          Ahora tienes acceso {pending?.tier === 'download' ? 'completo con descarga' : 'sin anuncios'} a<br />
          <em style={{ color: '#e8e3d9', fontStyle: 'italic' }}>{pending?.movieTitle}</em>
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn-primary" onClick={() => navigate(`/pelicula/${pending?.movieId}`)}>
            Ver ahora
          </button>
          <button className="btn-ghost" onClick={() => navigate('/mi-cuenta')}>
            Mi cuenta
          </button>
        </div>
      </div>
    </div>
  )

  if (status === 'failed') return (
    <div style={base}>
      <div style={{ textAlign: 'center', maxWidth: '440px' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          border: '1px solid rgba(192,57,43,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 32px', background: 'rgba(192,57,43,0.06)',
        }}>
          <span style={{ fontSize: '28px', color: '#c0392b' }}>✕</span>
        </div>
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '36px', fontWeight: 300, color: '#e8e3d9', marginBottom: '12px',
        }}>Pago no completado</h1>
        <div style={{ width: '36px', height: '1px', background: 'rgba(192,57,43,0.5)', margin: '0 auto 20px' }} />
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: '13px',
          color: '#6b6560', lineHeight: 1.8, marginBottom: '40px',
        }}>
          El pago fue cancelado o rechazado. No se realizó ningún cargo.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn-primary" onClick={() => {
            if (pending?.movieId) navigate(`/checkout/${pending.movieId}`)
            else navigate('/catalogo')
          }}>
            Intentar de nuevo
          </button>
          <button className="btn-ghost" onClick={() => navigate('/catalogo')}>
            Ver catálogo
          </button>
        </div>
      </div>
    </div>
  )

  // error
  return (
    <div style={base}>
      <div style={{ textAlign: 'center', maxWidth: '440px' }}>
        <p style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '28px', fontWeight: 300, color: '#6b6560', marginBottom: '24px',
        }}>No se pudo verificar el pago</p>
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: '12px',
          color: '#3d3a35', lineHeight: 1.7, marginBottom: '32px',
        }}>
          Si realizaste el pago y ves este mensaje, escríbenos a<br />
          <span style={{ color: '#9e9890' }}>contacto@zairofilms.com</span> con tu número de orden.
        </p>
        <button className="btn-ghost" onClick={() => navigate('/catalogo')}>
          Ir al catálogo
        </button>
      </div>
    </div>
  )
}
