import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Footer from '../components/layout/Footer'
import type { Movie } from '../data/movies'

export default function MiCuenta() {
  const { user, purchases, logout } = useAuth()
  const navigate = useNavigate()
  const [movieMap, setMovieMap] = useState<Record<string, Movie>>({})
  const [secureMap, setSecureMap] = useState<Record<string, string>>({})
  const [loadingMovies, setLoadingMovies] = useState(false)

  useEffect(() => {
    if (purchases.length === 0) return
    setLoadingMovies(true)

    const ids = purchases.map(p => p.movieId)

    const moviesQuery = supabase
      .from('movies')
      .select('*')
      .in('id', ids)
      .then(({ data }) => {
        if (!data) return
        const map: Record<string, Movie> = {}
        data.forEach((m: any) => { map[m.id] = m as Movie })
        setMovieMap(map)
      })

    const downloadIds = purchases.filter(p => p.tier === 'download').map(p => p.movieId)
    const secureQuery = downloadIds.length > 0
      ? supabase
          .from('movie_secure')
          .select('movie_id, video_url')
          .in('movie_id', downloadIds)
          .then(({ data }) => {
            if (!data) return
            const map: Record<string, string> = {}
            data.forEach((s: any) => { map[s.movie_id] = s.video_url })
            setSecureMap(map)
          })
      : Promise.resolve()

    Promise.all([moviesQuery, secureQuery]).finally(() => setLoadingMovies(false))
  }, [purchases])

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
            <div key={String(label)} style={{ background: '#0e0e0e', padding: '28px 32px' }}>
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
          ) : loadingMovies ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <p style={{
                fontFamily: 'Cormorant Garamond, serif', fontSize: '18px',
                fontWeight: 300, fontStyle: 'italic', color: '#3d3a35',
              }}>Cargando películas…</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.04)' }}>
              {purchases.map(p => {
                const movie = movieMap[p.movieId]
                const downloadUrl = secureMap[p.movieId]
                return (
                  <div key={p.movieId} style={{
                    background: '#0e0e0e',
                    padding: '20px 24px',
                    display: 'grid',
                    gridTemplateColumns: '56px 1fr auto auto',
                    gap: '16px',
                    alignItems: 'center',
                  }}>
                    {/* Mini poster */}
                    <div style={{
                      width: '56px', height: '72px', flexShrink: 0,
                      background: movie?.backdrop ?? '#111',
                      overflow: 'hidden', borderRadius: '1px',
                    }}>
                      {movie?.poster_url && (
                        <img
                          src={movie.poster_url}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      )}
                    </div>

                    <div>
                      <p style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: '18px', fontWeight: 400, color: movie ? '#e8e3d9' : '#3d3a35',
                      }}>{movie?.title ?? `Película ${p.movieId.slice(0, 8)}…`}</p>
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
                        onClick={() => navigate(`/pelicula/${p.movieId}`)}
                      >
                        Ver
                      </button>
                      {p.tier === 'download' && downloadUrl && (
                        <a
                          href={downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '10px', letterSpacing: '0.1em',
                            textTransform: 'uppercase', color: '#c9a227',
                            textDecoration: 'none',
                            border: '1px solid rgba(201,162,39,0.3)',
                            padding: '8px 16px',
                            transition: 'all 0.2s',
                            display: 'inline-flex', alignItems: 'center',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,162,39,0.08)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
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
