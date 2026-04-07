import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MOVIES } from '../data/movies'
import Footer from '../components/layout/Footer'

export default function MiCuenta() {
  const { user, purchases, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) { navigate('/login'); return null }

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '72px' }}>
      {/* Header */}
      <div style={{
        padding: '64px 48px 48px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: 'linear-gradient(to bottom, #0d0d0d, #080808)',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <span className="anim" style={{
            fontFamily: 'Inter, sans-serif', fontSize: '10px',
            fontWeight: 500, letterSpacing: '0.25em',
            textTransform: 'uppercase', color: '#c9a227',
          }}>Cuenta</span>
          <h1 className="anim anim-d1" style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 300, color: '#e8e3d9', marginTop: '12px',
          }}>
            {user.name}
          </h1>
          <p className="anim anim-d2" style={{
            fontFamily: 'Inter, sans-serif', fontSize: '13px',
            color: '#6b6560', marginTop: '8px',
          }}>{user.email}</p>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px' }}>
        {/* Stats */}
        <div className="anim" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1px', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.04)',
          marginBottom: '56px',
        }}>
          {[
            ['Películas compradas', purchases.length],
            ['Descargas disponibles', purchases.filter(p => p.tier === 'download').length],
            ['Total invertido', `$${purchases.reduce((s, p) => s + p.amount, 0)}`],
          ].map(([label, val]) => (
            <div key={String(label)} style={{
              background: '#0e0e0e', padding: '28px 32px',
            }}>
              <div style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '36px', fontWeight: 300, color: '#c9a227',
              }}>{val}</div>
              <div style={{
                fontFamily: 'Inter, sans-serif', fontSize: '11px',
                color: '#6b6560', letterSpacing: '0.08em', marginTop: '4px',
              }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Purchase history */}
        <div>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '10px',
            fontWeight: 500, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: '#c9a227',
            marginBottom: '24px',
          }}>Mis películas</p>

          {purchases.length === 0 ? (
            <div style={{
              padding: '64px 0', textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.04)',
            }}>
              <p style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '22px', fontWeight: 300, fontStyle: 'italic',
                color: '#3d3a35',
              }}>
                Aún no has comprado ninguna película.
              </p>
              <button
                className="btn-outline"
                style={{ marginTop: '24px' }}
                onClick={() => navigate('/catalogo')}
              >
                Ver catálogo
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
              {purchases.map(p => {
                const movie = MOVIES.find(m => m.id === p.movieId)
                if (!movie) return null
                return (
                  <div key={p.movieId} style={{
                    background: '#0e0e0e',
                    padding: '20px 24px',
                    display: 'grid',
                    gridTemplateColumns: '48px 1fr auto auto',
                    gap: '16px',
                    alignItems: 'center',
                  }}>
                    {/* Mini poster */}
                    <div style={{
                      width: '48px', height: '64px',
                      background: movie.backdrop, flexShrink: 0,
                    }} />

                    <div>
                      <p style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: '18px', fontWeight: 400, color: '#e8e3d9',
                      }}>{movie.title}</p>
                      <p style={{
                        fontFamily: 'Inter, sans-serif', fontSize: '11px',
                        color: '#6b6560', marginTop: '4px',
                      }}>
                        {p.tier === 'download' ? 'Ver + Descargar' : 'Ver sin anuncios'} ·{' '}
                        {new Date(p.date).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    <span style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '20px', color: '#c9a227',
                    }}>${p.amount}</span>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn-ghost"
                        style={{ padding: '8px 16px', fontSize: '10px' }}
                        onClick={() => navigate(`/pelicula/${movie.id}`)}
                      >
                        Ver
                      </button>
                      {p.tier === 'download' && (
                        <a
                          href={movie.video_url}
                          download
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '10px', letterSpacing: '0.1em',
                            textTransform: 'uppercase', color: '#c9a227',
                            textDecoration: 'none',
                            border: '1px solid rgba(201,162,39,0.3)',
                            padding: '8px 16px',
                            transition: 'all 0.2s',
                          }}
                        >
                          Descargar
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Logout */}
        <div style={{
          marginTop: '56px', paddingTop: '32px',
          borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', justifyContent: 'flex-end',
        }}>
          <button className="btn-ghost" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
