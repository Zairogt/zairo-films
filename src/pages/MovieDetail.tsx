import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import TrailerModal from '../components/TrailerModal'
import Footer from '../components/layout/Footer'
import AdUnit from '../components/AdUnit'
import type { Movie } from '../data/movies'

function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url)
    // youtube.com/watch?v=ID → embed
    if (u.hostname.includes('youtube.com') && u.pathname === '/watch') {
      const vid = u.searchParams.get('v')
      if (vid) return `https://www.youtube.com/embed/${vid}?autoplay=1`
    }
    // youtu.be/ID → embed
    if (u.hostname === 'youtu.be') {
      return `https://www.youtube.com/embed${u.pathname}?autoplay=1`
    }
    // vimeo.com/ID → player.vimeo.com/video/ID
    if (u.hostname === 'vimeo.com' && !u.hostname.includes('player')) {
      const id = u.pathname.replace(/^\//, '')
      return `https://player.vimeo.com/video/${id}?autoplay=1`
    }
    // Ya es embed (player.vimeo.com, youtube.com/embed, etc.) — solo añadir autoplay
    u.searchParams.set('autoplay', '1')
    return u.toString()
  } catch {
    return url
  }
}

export default function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, getAccess } = useAuth()
  const { showToast } = useToast()
  const [playing, setPlaying] = useState(false)
  const [showTrailer, setShowTrailer] = useState(false)
  const [movie, setMovie] = useState<Movie | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Cargar datos de la película
  useEffect(() => {
    if (!id) return
    Promise.resolve(
      supabase.from('movies').select('*').eq('id', id).single()
    )
      .then(({ data }) => { setMovie(data as Movie | null) })
      .catch(() => { setMovie(null) })
      .finally(() => setLoading(false))
  }, [id])

  // Cargar video_url para cualquier usuario logueado
  // (free = con anuncios, watch/download = sin anuncios — misma URL, distinta experiencia)
  useEffect(() => {
    if (!id || !user) return

    supabase
      .from('movie_secure')
      .select('video_url')
      .eq('movie_id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.video_url) setVideoUrl(data.video_url)
      })
  }, [id, user])

  const handleShare = useCallback(() => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: movie?.title, url })
    } else {
      navigator.clipboard.writeText(url)
      showToast('Link copiado al portapapeles')
    }
  }, [movie?.title, showToast])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#3d3a35', fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', fontStyle: 'italic' }}>
        Cargando…
      </p>
    </div>
  )

  if (!movie) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#6b6560', fontFamily: 'Cormorant Garamond, serif', fontSize: '24px' }}>
        Película no encontrada.
      </p>
    </div>
  )

  const access = getAccess(movie.id)

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Backdrop hero */}
      <div style={{
        position: 'relative',
        height: 'clamp(280px, 44vw, 480px)',
        overflow: 'hidden',
        background: '#080808',
        marginTop: '72px',
      }}>
        <img
          src={movie.poster_url}
          alt=""
          className="backdrop-img"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 25%',
            filter: 'brightness(0.6) saturate(1.15)',
          }}
        />

        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 60% 50%, transparent 25%, rgba(8,8,8,0.55) 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(8,8,8,0.9) 0%, rgba(8,8,8,0.4) 45%, transparent 75%)',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: '65%',
          background: 'linear-gradient(to top, #080808 0%, rgba(8,8,8,0.7) 40%, transparent 100%)',
        }} />

        <div className="hero-content" style={{
          position: 'absolute',
          bottom: 'clamp(20px, 3.5vw, 44px)',
          left: 'clamp(20px, 4vw, 48px)',
          right: '40%',
        }}>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontSize: '10px',
            fontWeight: 500, letterSpacing: '0.25em',
            textTransform: 'uppercase', color: '#c9a227',
            display: 'block', marginBottom: '12px',
          }}>
            {movie.genre} · {movie.year} · {movie.duration}
          </span>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(26px, 4.5vw, 64px)',
            fontWeight: 300, lineHeight: 1,
            color: '#e8e3d9', margin: '0 0 14px',
          }}>
            {movie.title}
          </h1>
          <div style={{ width: '32px', height: '1px', background: '#c9a227', marginBottom: '12px' }} />
          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(13px, 1.5vw, 17px)',
            fontStyle: 'italic', color: 'rgba(232,227,217,0.4)',
            lineHeight: 1.5,
          }}>
            "{movie.tagline}"
          </p>

          <div style={{ display: 'flex', gap: '12px', marginTop: '28px', flexWrap: 'wrap' }}>
            {movie.trailer_url && (
              <button
                className="btn-outline"
                onClick={() => setShowTrailer(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <span style={{ fontSize: '10px' }}>▶</span> Ver trailer
              </button>
            )}
            <button
              className="btn-ghost"
              onClick={handleShare}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span style={{ fontSize: '12px' }}>⤴</span> Compartir
            </button>
          </div>
        </div>
      </div>

      {showTrailer && movie.trailer_url && (
        <TrailerModal
          trailerUrl={movie.trailer_url}
          title={movie.title}
          onClose={() => setShowTrailer(false)}
        />
      )}

      {/* Main content */}
      <div style={{ padding: '0 clamp(16px, 4vw, 48px) 80px', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="two-col-grid" style={{ paddingTop: '40px' }}>

          {/* Left — info + player */}
          <div>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: '12px',
              color: '#6b6560', letterSpacing: '0.08em', marginBottom: '20px',
            }}>
              Dir. <span style={{ color: '#e8e3d9' }}>{movie.director}</span>
            </p>

            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: '14px',
              fontWeight: 300, color: '#9e9890',
              lineHeight: 1.9, marginBottom: '36px',
            }}>
              {movie.sinopsis}
            </p>

            {/* Ad — entre sinopsis y player, solo usuarios sin compra */}
            {(access === 'anon' || access === 'free') && (
              <div style={{ marginBottom: '16px' }}>
                <AdUnit slot="6818281717" format="horizontal" />
              </div>
            )}

            {/* Player area */}
            <div style={{
              background: '#0a0a0a',
              border: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden',
            }}>

              {access === 'anon' && (
                <div style={{
                  aspectRatio: '16/9', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,0,0,0.5)', gap: '20px', padding: '24px',
                }}>
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '50%',
                    border: '1px solid rgba(201,162,39,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: '22px', color: '#c9a227' }}>▶</span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: 'clamp(17px, 3vw, 22px)', fontWeight: 300, color: '#e8e3d9',
                    }}>Inicia sesión para ver</p>
                    <p style={{
                      fontFamily: 'Inter, sans-serif', fontSize: '12px',
                      color: '#6b6560', marginTop: '6px',
                    }}>Registro gratuito · acceso completo con anuncios</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <button className="btn-primary" onClick={() => navigate('/login')}>Ingresar</button>
                    <button className="btn-outline" onClick={() => navigate('/signup')}>Registro gratis</button>
                  </div>
                </div>
              )}

              {access === 'free' && !playing && (
                <div>
                  <div style={{
                    aspectRatio: '16/9', position: 'relative',
                    background: movie.backdrop, overflow: 'hidden',
                  }}>
                    <img src={movie.poster_url} alt="" style={{
                      position: 'absolute', inset: 0, width: '100%', height: '100%',
                      objectFit: 'cover', filter: 'brightness(0.4)',
                    }} />
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: '14px',
                    }}>
                      <div style={{
                        position: 'absolute', top: '10px', left: '10px', right: '10px',
                        height: '50px', background: 'rgba(0,0,0,0.75)',
                        border: '1px dashed rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: '#3d3a35', letterSpacing: '0.1em' }}>
                          Google Ads — visible a usuarios sin compra
                        </span>
                      </div>
                      <button
                        onClick={() => setPlaying(true)}
                        style={{
                          width: '64px', height: '64px', borderRadius: '50%',
                          background: 'rgba(201,162,39,0.15)',
                          border: '1px solid rgba(201,162,39,0.4)',
                          color: '#c9a227', fontSize: '22px',
                          cursor: 'pointer', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.25s',
                        }}
                      >▶</button>
                    </div>
                  </div>
                  <div style={{
                    padding: '14px 18px',
                    background: 'rgba(201,162,39,0.04)',
                    borderTop: '1px solid rgba(201,162,39,0.1)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px',
                  }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#8b7355' }}>
                      Viendo con anuncios
                    </span>
                    <button
                      className="btn-primary" style={{ padding: '8px 18px', fontSize: '10px' }}
                      onClick={() => navigate(`/checkout/${movie.id}`)}
                    >
                      Quitar anuncios · ${movie.precio_ver}
                    </button>
                  </div>
                </div>
              )}

              {access === 'free' && playing && videoUrl && (
                <div>
                  <div style={{ aspectRatio: '16/9', position: 'relative' }}>
                    <iframe
                      src={toEmbedUrl(videoUrl)}
                      style={{ width: '100%', height: '100%', border: 'none' }}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={movie.title}
                    />
                    <div style={{
                      position: 'absolute', bottom: '48px', left: '10px', right: '10px',
                      height: '70px', background: 'rgba(0,0,0,0.8)',
                      border: '1px dashed rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      pointerEvents: 'none',
                    }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: '#3d3a35' }}>
                        Google Ads — mid-roll
                      </span>
                    </div>
                  </div>
                  <div style={{
                    padding: '14px 18px', background: 'rgba(201,162,39,0.04)',
                    borderTop: '1px solid rgba(201,162,39,0.1)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px',
                  }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#8b7355' }}>
                      Viendo con anuncios
                    </span>
                    <button
                      className="btn-primary" style={{ padding: '8px 18px', fontSize: '10px' }}
                      onClick={() => navigate(`/checkout/${movie.id}`)}
                    >
                      Quitar anuncios · ${movie.precio_ver}
                    </button>
                  </div>
                </div>
              )}

              {(access === 'watch' || access === 'download') && (
                <div>
                  <div style={{ aspectRatio: '16/9' }}>
                    {videoUrl ? (
                      <iframe
                        src={toEmbedUrl(videoUrl)}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title={movie.title}
                      />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: '#0a0a0a',
                      }}>
                        <p style={{ color: '#3d3a35', fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
                          Cargando video…
                        </p>
                      </div>
                    )}
                  </div>
                  <div style={{
                    padding: '14px 18px', background: 'rgba(201,162,39,0.04)',
                    borderTop: '1px solid rgba(201,162,39,0.1)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#c9a227' }}>✓</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#8b7355' }}>
                        Sin anuncios
                      </span>
                    </div>
                    {access === 'watch' ? (
                      <button
                        className="btn-outline" style={{ padding: '8px 18px', fontSize: '10px' }}
                        onClick={() => navigate(`/checkout/${movie.id}?tier=download`)}
                      >
                        Upgrade + Descargar · ${movie.precio_descargar}
                      </button>
                    ) : (
                      <a href={videoUrl ?? '#'} download style={{
                        fontFamily: 'Inter, sans-serif', fontSize: '10px',
                        letterSpacing: '0.12em', textTransform: 'uppercase',
                        color: '#c9a227', textDecoration: 'none',
                        border: '1px solid rgba(201,162,39,0.3)',
                        padding: '8px 18px',
                      }}>
                        Descargar
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Ad — debajo del player, solo usuarios sin compra */}
            {(access === 'anon' || access === 'free') && (
              <div style={{ marginTop: '16px' }}>
                <AdUnit slot="8492111026" format="auto" />
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div>
            <div style={{
              background: '#0e0e0e',
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '28px', marginBottom: '20px',
            }}>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: '10px',
                fontWeight: 500, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: '#c9a227', marginBottom: '20px',
              }}>Información</p>
              {[
                ['Género', movie.genre],
                ['Año', String(movie.year)],
                ['Duración', movie.duration],
                ['Director', movie.director],
              ].map(([label, val]) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '11px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6b6560' }}>{label}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#e8e3d9' }}>{val}</span>
                </div>
              ))}
            </div>

            {access === 'anon' || access === 'free' ? (
              <div style={{
                background: '#0e0e0e',
                border: '1px solid rgba(255,255,255,0.06)',
                padding: '28px',
              }}>
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '10px',
                  fontWeight: 500, letterSpacing: '0.2em',
                  textTransform: 'uppercase', color: '#c9a227', marginBottom: '20px',
                }}>Acceso</p>

                <div style={{ padding: '18px', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '17px', color: '#e8e3d9' }}>
                      Ver sin anuncios
                    </span>
                    <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', color: '#c9a227' }}>
                      ${movie.precio_ver}
                    </span>
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6b6560', marginBottom: '14px' }}>
                    Acceso ilimitado · sin publicidad
                  </p>
                  <button
                    className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => user ? navigate(`/checkout/${movie.id}`) : navigate('/login')}
                  >
                    Comprar acceso
                  </button>
                </div>

                <div style={{
                  padding: '18px',
                  border: '1px solid rgba(201,162,39,0.15)',
                  background: 'rgba(201,162,39,0.03)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '17px', color: '#e8e3d9' }}>
                      Ver + Descargar
                    </span>
                    <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', color: '#c9a227' }}>
                      ${movie.precio_descargar}
                    </span>
                  </div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6b6560', marginBottom: '14px' }}>
                    Incluye descarga permanente
                  </p>
                  <button
                    className="btn-outline" style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => user ? navigate(`/checkout/${movie.id}?tier=download`) : navigate('/login')}
                  >
                    Comprar + Descargar
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                background: '#0e0e0e',
                border: '1px solid rgba(201,162,39,0.2)',
                padding: '20px',
                display: 'flex', alignItems: 'center', gap: '14px',
              }}>
                <span style={{ fontSize: '22px', color: '#c9a227' }}>✓</span>
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#e8e3d9' }}>
                    {access === 'download' ? 'Acceso completo + descarga' : 'Acceso sin anuncios'}
                  </p>
                  <Link to="/mi-cuenta" style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '11px',
                    color: '#c9a227', textDecoration: 'none',
                  }}>
                    Ver mis compras →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
