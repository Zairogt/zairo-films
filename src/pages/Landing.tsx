import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { FEATURED_MOVIE } from '../data/movies'
import MovieCard from '../components/MovieCard'
import Footer from '../components/layout/Footer'
import type { Movie } from '../data/movies'

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [movies, setMovies] = useState<Movie[]>([])
  const [featuredMovie, setFeaturedMovie] = useState<Movie>(FEATURED_MOVIE)

  // Detecta si el usuario llegó desde un redirect de OAuth (hay ?code= en la URL)
  // supabase-js borra ese parámetro después de canjearlo, por eso usamos ref
  const wasOAuthRedirect = useRef(
    new URLSearchParams(window.location.search).has('code')
  )

  useEffect(() => {
    if (user && wasOAuthRedirect.current) {
      navigate('/catalogo', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    supabase
      .from('movies')
      .select('*')
      .order('sort_order')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setMovies(data as Movie[])
          const feat = data.find(m => m.featured) ?? data[0]
          setFeaturedMovie(feat as Movie)
        }
      })
  }, [])

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        position: 'relative',
        height: '100svh',
        minHeight: '560px',
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
      }}>
        {/* Backdrop: poster blurred */}
        <img
          src={featuredMovie.poster_url}
          alt=""
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            filter: 'blur(2px) brightness(0.45)',
            transform: 'scale(1.04)',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 60% 40%, transparent 10%, rgba(8,8,8,0.55) 80%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(8,8,8,1) 0%, rgba(8,8,8,0.3) 50%, rgba(8,8,8,0.15) 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(8,8,8,0.7) 0%, transparent 60%)',
        }} />

        {/* Content */}
        <div style={{
          position: 'relative',
          padding: 'clamp(24px, 5vw, 80px)',
          paddingBottom: 'clamp(48px, 8vw, 96px)',
          maxWidth: '700px',
        }}>
          <div className="anim" style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '10px', fontWeight: 500,
            letterSpacing: '0.25em', textTransform: 'uppercase',
            color: '#c9a227', marginBottom: '16px',
          }}>
            Película destacada · {featuredMovie.genre} · {featuredMovie.year}
          </div>

          <h1 className="anim anim-d1" style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(40px, 8vw, 88px)',
            fontWeight: 300,
            lineHeight: 0.95,
            color: '#e8e3d9',
            marginBottom: '20px',
            letterSpacing: '-0.01em',
          }}>
            {featuredMovie.title}
          </h1>

          <div className="anim anim-d2" style={{
            width: '40px', height: '1px', background: '#c9a227', marginBottom: '20px',
          }} />

          <p className="anim anim-d2" style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(15px, 2vw, 18px)',
            fontStyle: 'italic',
            color: 'rgba(232,227,217,0.6)',
            marginBottom: '14px', lineHeight: 1.6,
          }}>
            "{featuredMovie.tagline}"
          </p>

          <p className="anim anim-d3" style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'clamp(12px, 1.5vw, 13px)',
            fontWeight: 300,
            color: 'rgba(232,227,217,0.45)',
            lineHeight: 1.8, marginBottom: '32px',
            maxWidth: '460px',
          }}>
            {featuredMovie.sinopsis}
          </p>

          <div className="anim anim-d4" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => navigate(`/pelicula/${featuredMovie.id}`)}>
              Ver ahora
            </button>
            <button className="btn-outline" onClick={() => navigate('/catalogo')}>
              Catálogo completo
            </button>
          </div>
        </div>

        {/* Scroll indicator — hidden on mobile */}
        <div style={{
          position: 'absolute', bottom: '32px', right: '48px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
        }} className="hide-mobile">
          <div style={{
            fontFamily: 'Inter, sans-serif', fontSize: '9px',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            color: '#3d3a35', writingMode: 'vertical-rl',
          }}>Scroll</div>
          <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.12)' }} />
        </div>
      </section>

      {/* Ad Banner (mock) */}
      <div style={{
        background: '#0a0a0a',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        padding: '12px 24px',
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px',
      }}>
        <span style={{
          fontFamily: 'Inter, sans-serif', fontSize: '9px',
          letterSpacing: '0.15em', textTransform: 'uppercase', color: '#2e2b26',
        }}>Publicidad</span>
        <div style={{
          flex: 1, maxWidth: '728px', height: '70px',
          background: 'rgba(255,255,255,0.015)',
          border: '1px dashed rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontSize: '9px',
            color: '#2e2b26', letterSpacing: '0.1em',
          }}>Google AdSense — 728×90</span>
        </div>
      </div>

      {/* Catalogue section */}
      <section style={{ padding: 'clamp(48px, 6vw, 80px) clamp(20px, 4vw, 48px)', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
          <span style={{
            fontFamily: 'Inter, sans-serif', fontSize: '10px',
            fontWeight: 500, letterSpacing: '0.25em',
            textTransform: 'uppercase', color: '#c9a227',
          }}>Colección</span>
          <h2 style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(28px, 4vw, 52px)',
            fontWeight: 300, color: '#e8e3d9',
            marginTop: '10px', lineHeight: 1.1,
          }}>Toda la filmografía</h2>
          <div style={{ width: '36px', height: '1px', background: '#c9a227', marginTop: '14px' }} />
        </div>

        <div className="catalog-grid">
          {movies.map((movie, i) => (
            <MovieCard key={movie.id} movie={movie} index={i} />
          ))}
        </div>
      </section>

      {/* Director section */}
      <section style={{
        padding: 'clamp(48px, 6vw, 80px) clamp(20px, 4vw, 48px)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        maxWidth: '1400px', margin: '0 auto',
      }}>
        <div className="director-grid">
          <div>
            <span style={{
              fontFamily: 'Inter, sans-serif', fontSize: '10px',
              fontWeight: 500, letterSpacing: '0.25em',
              textTransform: 'uppercase', color: '#c9a227',
            }}>El Director</span>
            <h2 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(24px, 3vw, 44px)',
              fontWeight: 300, color: '#e8e3d9',
              marginTop: '12px', lineHeight: 1.15,
            }}>
              Rodolfo Espinoza<br />
              <em style={{ fontStyle: 'italic', color: 'rgba(232,227,217,0.45)' }}>Orantes</em>
            </h2>
            <div style={{ width: '36px', height: '1px', background: '#c9a227', margin: '20px 0' }} />
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: '13px',
              fontWeight: 300, color: '#6b6560', lineHeight: 1.85,
              fontStyle: 'italic',
            }}>
              Próximamente...
            </p>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
            border: '1px solid rgba(255,255,255,0.06)',
            padding: 'clamp(24px, 4vw, 48px)',
            position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <p style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 'clamp(17px, 2vw, 22px)',
              fontWeight: 300, fontStyle: 'italic',
              color: 'rgba(232,227,217,0.25)', lineHeight: 1.65,
            }}>
              Próximamente...
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
