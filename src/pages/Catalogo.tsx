import { useState } from 'react'
import { MOVIES } from '../data/movies'
import MovieCard from '../components/MovieCard'
import AdCard from '../components/AdCard'
import Footer from '../components/layout/Footer'
import type { Movie } from '../data/movies'

// Inserta un AdCard cada AD_EVERY películas
const AD_EVERY = 3

type GridItem = { type: 'movie'; movie: Movie; idx: number } | { type: 'ad'; key: string }

function buildGrid(movies: Movie[]): GridItem[] {
  const items: GridItem[] = []
  let adCount = 0
  movies.forEach((movie, i) => {
    items.push({ type: 'movie', movie, idx: i })
    if ((i + 1) % AD_EVERY === 0) {
      adCount++
      items.push({ type: 'ad', key: `ad-${adCount}` })
    }
  })
  return items
}

export default function Catalogo() {
  const [search, setSearch] = useState('')

  const filtered = MOVIES.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase())
  )

  const grid = buildGrid(filtered)

  return (
    <div style={{ minHeight: '100vh', paddingTop: '72px' }}>
      {/* Header */}
      <div style={{
        padding: 'clamp(48px, 6vw, 64px) clamp(20px, 4vw, 48px) 36px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: 'linear-gradient(to bottom, #0d0d0d, #080808)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <span className="anim" style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: '#c9a227',
          }}>Filmografía</span>
          <h1 className="anim anim-d1" style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(36px, 5vw, 64px)',
            fontWeight: 300,
            color: '#e8e3d9',
            marginTop: '12px',
            lineHeight: 1,
          }}>
            Catálogo Completo
          </h1>
          <div className="anim anim-d2" style={{
            width: '36px', height: '1px',
            background: '#c9a227', margin: '20px 0',
          }} />
          <div className="anim anim-d3">
            <input
              className="input-field"
              type="text"
              placeholder="Buscar película..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ maxWidth: '320px' }}
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: 'clamp(24px, 4vw, 48px)', maxWidth: '1200px', margin: '0 auto' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '24px',
              fontWeight: 300,
              fontStyle: 'italic',
              color: '#3d3a35',
            }}>
              Sin resultados para "{search}"
            </p>
          </div>
        ) : (
          <>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              color: '#3d3a35',
              letterSpacing: '0.1em',
              marginBottom: '32px',
            }}>
              {filtered.length} {filtered.length === 1 ? 'película' : 'películas'}
            </p>

            <div className="catalog-grid">
              {grid.map(item =>
                item.type === 'movie' ? (
                  <MovieCard key={item.movie.id} movie={item.movie} index={item.idx} />
                ) : (
                  <AdCard key={item.key} />
                )
              )}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
