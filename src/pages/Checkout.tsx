import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import type { Movie } from '../data/movies'

export default function Checkout() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, getAccess } = useAuth()
  const { showToast } = useToast()

  const [movie, setMovie] = useState<Movie | null>(null)
  const [movieLoading, setMovieLoading] = useState(true)
  const defaultTier = searchParams.get('tier') === 'download' ? 'download' : 'watch'
  const [tier, setTier] = useState<'watch' | 'download'>(defaultTier)
  const [loading, setLoading] = useState<'pagadito' | 'stripe' | null>(null)

  useEffect(() => {
    if (!id) return
    Promise.resolve(
      supabase.from('movies').select('*').eq('id', id).single()
    )
      .then(({ data }) => { setMovie(data as Movie | null) })
      .catch(() => { setMovie(null) })
      .finally(() => setMovieLoading(false))
  }, [id])

  if (!user) { navigate('/login'); return null }

  if (movieLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', fontWeight: 300, fontStyle: 'italic', color: '#3d3a35' }}>
        Cargando…
      </p>
    </div>
  )

  if (!movie) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', fontWeight: 300, color: '#6b6560' }}>
        Película no encontrada.
      </p>
    </div>
  )

  const currentAccess = getAccess(movie.id)
  if (currentAccess === 'download' || (currentAccess === 'watch' && defaultTier === 'watch')) return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 30%, #0d1a0d 0%, #080808 60%)',
      padding: '24px',
    }}>
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
          fontSize: '36px', fontWeight: 300, color: '#e8e3d9', marginBottom: '12px',
        }}>Ya tienes esta película</h1>
        <div style={{ width: '36px', height: '1px', background: '#c9a227', margin: '0 auto 20px' }} />
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: '13px',
          color: '#6b6560', lineHeight: 1.8, marginBottom: '40px',
        }}>
          <em style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '17px', color: '#e8e3d9', fontStyle: 'italic' }}>{movie.title}</em>
          <br />ya está en tu biblioteca con acceso{' '}
          {currentAccess === 'download' ? 'de descarga' : 'sin anuncios'}.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => navigate(`/pelicula/${movie.id}`)}>
            Ver ahora
          </button>
          <button className="btn-ghost" onClick={() => navigate('/mi-cuenta')}>
            Mi cuenta
          </button>
        </div>
        {currentAccess === 'watch' && defaultTier === 'download' && (
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '11px',
            color: '#3d3a35', marginTop: '24px', lineHeight: 1.7,
          }}>
            Tienes acceso de visualización. Para agregar la descarga,<br />
            <button
              onClick={() => { /* permitir upgrade */ }}
              style={{ background: 'transparent', border: 'none', color: '#c9a227', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '11px', padding: 0 }}
            >
              contacta a soporte.
            </button>
          </p>
        )}
      </div>
    </div>
  )

  const price = tier === 'watch' ? movie.precio_ver : movie.precio_descargar

  const PENDING_KEY = 'zf_pending_payment'

  const handlePagadito = async () => {
    setLoading('pagadito')
    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId: movie.id, movieTitle: movie.title, tier, amount: price, userId: user.id }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Error')
      localStorage.setItem(PENDING_KEY, JSON.stringify({ movieId: movie.id, movieTitle: movie.title, tier, amount: price, ern: data.ern }))
      window.location.href = data.url
    } catch {
      showToast('No se pudo iniciar el pago. Intenta de nuevo.')
      setLoading(null)
    }
  }

  const handleStripe = async () => {
    setLoading('stripe')
    try {
      const res = await fetch('/api/create-stripe-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId: movie.id, movieTitle: movie.title, tier, amount: price, userId: user.id }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Error')
      window.location.href = data.url
    } catch {
      showToast('No se pudo iniciar el pago. Intenta de nuevo.')
      setLoading(null)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', paddingTop: '72px',
      background: 'radial-gradient(ellipse at 50% 0%, #120e00 0%, #080808 50%)',
    }}>
      <div className="checkout-grid" style={{
        maxWidth: '900px', margin: '0 auto',
        padding: 'clamp(40px, 6vw, 64px) clamp(16px, 4vw, 48px)',
      }}>

        {/* Left — form */}
        <div>
          <button
            onClick={() => navigate(`/pelicula/${id}`)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontSize: '11px',
              color: '#3d3a35', letterSpacing: '0.08em',
              padding: 0, marginBottom: '32px',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#6b6560')}
            onMouseLeave={e => (e.currentTarget.style.color = '#3d3a35')}
          >
            ← Volver a la película
          </button>

          <span className="anim" style={{
            fontFamily: 'Inter, sans-serif', fontSize: '10px',
            fontWeight: 500, letterSpacing: '0.25em',
            textTransform: 'uppercase', color: '#c9a227',
          }}>Pago seguro</span>
          <h1 className="anim anim-d1" style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '40px', fontWeight: 300,
            color: '#e8e3d9', margin: '12px 0 8px',
          }}>Checkout</h1>
          <div style={{ width: '36px', height: '1px', background: '#c9a227', marginBottom: '40px' }} />

          {/* Tier selector */}
          <div style={{ marginBottom: '40px' }}>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: '10px',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: '#6b6560', marginBottom: '16px',
            }}>Selecciona tu acceso</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {([
                ['watch', `Ver sin anuncios`, movie.precio_ver, 'Acceso ilimitado · sin publicidad'],
                ['download', `Ver + Descargar`, movie.precio_descargar, 'Incluye archivo de descarga permanente'],
              ] as const).map(([t, label, p, desc]) => (
                <div
                  key={t}
                  onClick={() => setTier(t)}
                  style={{
                    padding: '20px 24px',
                    border: `1px solid ${tier === t ? 'rgba(201,162,39,0.5)' : 'rgba(255,255,255,0.06)'}`,
                    background: tier === t ? 'rgba(201,162,39,0.04)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{
                      width: '16px', height: '16px', borderRadius: '50%',
                      border: `1px solid ${tier === t ? '#c9a227' : 'rgba(255,255,255,0.2)'}`,
                      background: tier === t ? '#c9a227' : 'transparent',
                      flexShrink: 0,
                    }} />
                    <div>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: '#e8e3d9' }}>{label}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6b6560', marginTop: '3px' }}>{desc}</p>
                    </div>
                  </div>
                  <span style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '22px', color: '#c9a227',
                  }}>${p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Opciones de pago */}
          <div>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: '10px',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: '#6b6560', marginBottom: '16px',
            }}>Método de pago</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Stripe */}
              <button
                className="btn-primary"
                onClick={handleStripe}
                disabled={loading !== null}
                style={{ width: '100%', justifyContent: 'center', fontSize: '12px' }}
              >
                {loading === 'stripe' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <span style={{ width: '12px', height: '12px', border: '1px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Redirigiendo…
                  </span>
                ) : `Pagar $${price} con Stripe`}
              </button>

              {/* Pagadito */}
              <button
                className="btn-outline"
                onClick={handlePagadito}
                disabled={loading !== null}
                style={{ width: '100%', justifyContent: 'center', fontSize: '12px' }}
              >
                {loading === 'pagadito' ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                    <span style={{ width: '12px', height: '12px', border: '1px solid rgba(201,162,39,0.4)', borderTopColor: '#c9a227', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                    Redirigiendo…
                  </span>
                ) : `Pagar $${price} con Pagadito`}
              </button>
            </div>

            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ color: '#3d3a35', fontSize: '12px' }}>🔒</span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#3d3a35', letterSpacing: '0.05em', lineHeight: 1.6 }}>
                Stripe acepta tarjetas internacionales · Pagadito acepta tarjetas guatemaltecas
              </span>
            </div>
          </div>
        </div>

        {/* Right — order summary */}
        <div className="checkout-summary-sticky" style={{
          background: '#0e0e0e',
          border: '1px solid rgba(255,255,255,0.06)',
          padding: '32px',
          position: 'sticky',
          top: '96px',
        }}>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '10px',
            fontWeight: 500, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: '#c9a227',
            marginBottom: '24px',
          }}>Resumen</p>

          {/* Movie poster */}
          <div style={{
            width: '100%', aspectRatio: '16/9',
            background: movie.backdrop, marginBottom: '20px',
            overflow: 'hidden', position: 'relative',
          }}>
            {movie.poster_url && (
              <img src={movie.poster_url} alt={movie.title} style={{
                width: '100%', height: '100%',
                objectFit: 'cover', display: 'block',
              }} />
            )}
          </div>

          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '20px', fontWeight: 400, color: '#e8e3d9',
          }}>{movie.title}</p>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '11px',
            color: '#6b6560', marginTop: '4px',
          }}>{movie.genre} · {movie.year} · {movie.duration}</p>

          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.04)',
            marginTop: '24px', paddingTop: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6b6560' }}>
                {tier === 'watch' ? 'Ver sin anuncios' : 'Ver + Descargar'}
              </span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#e8e3d9' }}>
                ${price}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6b6560' }}>
                Procesado por Pagadito
              </span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6b6560' }}>
                —
              </span>
            </div>
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.06)',
              marginTop: '12px', paddingTop: '12px',
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: '#e8e3d9' }}>
                Total
              </span>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', color: '#c9a227' }}>
                ${price}
              </span>
            </div>
          </div>

          <div style={{
            marginTop: '24px', padding: '16px',
            background: 'rgba(201,162,39,0.04)',
            border: '1px solid rgba(201,162,39,0.1)',
          }}>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: '10px',
              color: '#8b7355', lineHeight: 1.7,
            }}>
              Rodolfo recibe <strong style={{ color: '#c9a227' }}>85%</strong> de cada venta.
              Zairo Films retiene el 15% como plataforma.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
