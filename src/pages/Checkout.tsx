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
  const { user, buyMovie } = useAuth()
  const { showToast } = useToast()

  const [movie, setMovie] = useState<Movie | null>(null)
  const [movieLoading, setMovieLoading] = useState(true)
  const defaultTier = searchParams.get('tier') === 'download' ? 'download' : 'watch'
  const [tier, setTier] = useState<'watch' | 'download'>(defaultTier)
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '', name: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!id) return
    supabase
      .from('movies')
      .select('*')
      .eq('id', id)
      .single()
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

  const price = tier === 'watch' ? movie.precio_ver : movie.precio_descargar

  const handlePay = async () => {
    if (!card.number || !card.expiry || !card.cvc || !card.name) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 1800))
    buyMovie(movie.id, tier, price)
    showToast('¡Compra exitosa! Ya puedes ver sin anuncios.')
    setLoading(false)
    setDone(true)
  }

  if (done) return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 30%, #0d1a0d 0%, #080808 60%)',
    }}>
      <div className="anim" style={{ textAlign: 'center', maxWidth: '440px', padding: '0 24px' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          border: '1px solid rgba(201,162,39,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 32px',
          background: 'rgba(201,162,39,0.06)',
        }}>
          <span style={{ fontSize: '28px', color: '#c9a227' }}>✓</span>
        </div>
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '40px', fontWeight: 300, color: '#e8e3d9',
          marginBottom: '12px',
        }}>Compra exitosa</h1>
        <div style={{ width: '36px', height: '1px', background: '#c9a227', margin: '0 auto 20px' }} />
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: '13px',
          color: '#6b6560', lineHeight: 1.8, marginBottom: '40px',
        }}>
          Ahora tienes acceso {tier === 'download' ? 'completo con descarga' : 'sin anuncios'} a<br />
          <em style={{ color: '#e8e3d9', fontStyle: 'italic' }}>{movie.title}</em>
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn-primary" onClick={() => navigate(`/pelicula/${movie.id}`)}>
            Ver ahora
          </button>
          <button className="btn-ghost" onClick={() => navigate('/mi-cuenta')}>
            Mi cuenta
          </button>
        </div>
      </div>
    </div>
  )

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

          {/* Card form (mock Stripe) */}
          <div>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: '10px',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: '#6b6560', marginBottom: '28px',
            }}>Datos de pago</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <input
                className="input-field"
                type="text"
                placeholder="Nombre en la tarjeta"
                value={card.name}
                onChange={e => setCard({ ...card, name: e.target.value })}
              />
              <input
                className="input-field"
                type="text"
                placeholder="Número de tarjeta"
                value={card.number}
                maxLength={19}
                onChange={e => setCard({ ...card, number: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() })}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <input
                  className="input-field"
                  type="text"
                  placeholder="MM / AA"
                  value={card.expiry}
                  maxLength={5}
                  onChange={e => setCard({ ...card, expiry: e.target.value })}
                />
                <input
                  className="input-field"
                  type="text"
                  placeholder="CVC"
                  value={card.cvc}
                  maxLength={4}
                  onChange={e => setCard({ ...card, cvc: e.target.value.replace(/\D/g, '') })}
                />
              </div>
            </div>

            <div style={{
              marginTop: '16px', marginBottom: '32px',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span style={{ color: '#3d3a35', fontSize: '12px' }}>🔒</span>
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: '10px',
                color: '#3d3a35', letterSpacing: '0.05em',
              }}>
                Pago procesado por Stripe · Modo demo (no se cobra nada)
              </span>
            </div>

            <button
              className="btn-primary"
              onClick={handlePay}
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', fontSize: '12px' }}
            >
              {loading ? 'Procesando pago...' : `Pagar $${price}`}
            </button>
          </div>
        </div>

        {/* Right — order summary */}
        <div style={{
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
                Comisión Stripe
              </span>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6b6560' }}>
                ~$0.59
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
