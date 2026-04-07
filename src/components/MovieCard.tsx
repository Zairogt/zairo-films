import { useNavigate } from 'react-router-dom'
import type { Movie } from '../data/movies'
import LazyImage from './LazyImage'

interface Props {
  movie: Movie
  index?: number
}

export default function MovieCard({ movie, index = 0 }: Props) {
  const navigate = useNavigate()

  return (
    <div
      className="card-hover anim"
      style={{
        animationDelay: `${index * 0.08}s`,
        cursor: 'pointer',
        background: '#0e0e0e',
        display: 'flex',
        flexDirection: 'column',
      }}
      onClick={() => navigate(`/pelicula/${movie.id}`)}
    >
      {/* Poster — imagen completa, sin recorte */}
      <div style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        background: movie.backdrop,
        flexShrink: 0,
        lineHeight: 0, /* elimina espacio extra debajo del img */
      }}>
        <LazyImage
          src={movie.poster_url}
          alt={movie.title}
          className="poster-img"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            transition: 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)',
          }}
        />

        {/* Overlay hover */}
        <div className="poster-overlay" style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.35s ease',
        }}>
          <div className="poster-cta" style={{
            opacity: 0,
            transform: 'translateY(8px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            background: 'rgba(0,0,0,0.8)',
            border: '1px solid rgba(201,162,39,0.5)',
            padding: '10px 24px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#c9a227',
          }}>
            Ver película
          </div>
        </div>

        {/* Badge año */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(6px)',
          padding: '3px 9px',
          fontFamily: 'Inter, sans-serif',
          fontSize: '10px',
          color: '#9e9890',
          letterSpacing: '0.08em',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          {movie.year}
        </div>
      </div>

      {/* Info */}
      <div style={{
        padding: '14px 16px 12px',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        borderTop: '2px solid rgba(201,162,39,0.15)',
      }}>
        <h3 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '17px',
          fontWeight: 400,
          color: '#e8e3d9',
          lineHeight: 1.25,
          margin: 0,
        }}>
          {movie.title}
        </h3>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '8px',
        }}>
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '10px',
            color: '#6b6560',
            letterSpacing: '0.05em',
          }}>
            {movie.duration}
          </span>
          <span style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '16px',
            color: '#c9a227',
          }}>
            ${movie.precio_ver}
          </span>
        </div>
      </div>
    </div>
  )
}
