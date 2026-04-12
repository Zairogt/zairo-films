import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import Footer from '../components/layout/Footer'
import type { Movie } from '../data/movies'

const COOLDOWN_DAYS = 7 * 30 // 7 meses ≈ 210 días

function canChangeName(nameUpdatedAt: string | null): boolean {
  if (!nameUpdatedAt) return true
  const diff = Date.now() - new Date(nameUpdatedAt).getTime()
  return diff >= COOLDOWN_DAYS * 24 * 60 * 60 * 1000
}

function nextChangeDate(nameUpdatedAt: string | null): string {
  if (!nameUpdatedAt) return ''
  const next = new Date(new Date(nameUpdatedAt).getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000)
  return next.toLocaleDateString('es-GT', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function MiCuenta() {
  const { user, purchases, logout, updateName } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [movieMap, setMovieMap] = useState<Record<string, Movie>>({})
  const [secureMap, setSecureMap] = useState<Record<string, string>>({})
  const [loadingMovies, setLoadingMovies] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [savingName, setSavingName] = useState(false)

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

  const handleSaveName = async () => {
    const trimmed = nameInput.trim()
    if (!trimmed || trimmed === user.name) { setEditingName(false); return }
    setSavingName(true)
    try {
      await updateName(trimmed)
      setEditingName(false)
      showToast('Nombre actualizado')
    } catch {
      showToast('Error al guardar el nombre')
    } finally {
      setSavingName(false)
    }
  }

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

          {editingName ? (
            <div className="anim anim-d1" style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <input
                autoFocus
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSaveName()
                  if (e.key === 'Escape') setEditingName(false)
                }}
                style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 300,
                  color: '#e8e3d9', background: 'transparent',
                  border: 'none', borderBottom: '1px solid rgba(201,162,39,0.5)',
                  outline: 'none', padding: '0 4px 4px',
                  minWidth: '200px', maxWidth: '400px',
                }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSaveName}
                  disabled={savingName || !nameInput.trim()}
                  style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '9px',
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: '#c9a227', background: 'rgba(201,162,39,0.08)',
                    border: '1px solid rgba(201,162,39,0.3)',
                    padding: '6px 14px', cursor: 'pointer',
                    opacity: savingName || !nameInput.trim() ? 0.4 : 1,
                  }}
                >
                  {savingName ? 'Guardando…' : 'Guardar'}
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '9px',
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: '#6b6560', background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '6px 14px', cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="anim anim-d1" style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <h1 style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(32px, 4vw, 52px)',
                fontWeight: 300, color: '#e8e3d9', margin: 0,
              }}>
                {user.name}
              </h1>
              {canChangeName(user.nameUpdatedAt) ? (
                <button
                  onClick={() => { setNameInput(user.name); setEditingName(true) }}
                  style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '9px',
                    letterSpacing: '0.15em', textTransform: 'uppercase',
                    color: '#6b6560', background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '5px 12px', cursor: 'pointer',
                    transition: 'color 0.2s, border-color 0.2s',
                    marginTop: '6px',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#c9a227'; e.currentTarget.style.borderColor = 'rgba(201,162,39,0.3)' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#6b6560'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                >
                  Editar nombre
                </button>
              ) : (
                <span style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '10px',
                  color: '#3d3a35', marginTop: '6px',
                }}>
                  Puedes cambiarlo el {nextChangeDate(user.nameUpdatedAt)}
                </span>
              )}
            </div>
          )}

          <p className="anim anim-d2" style={{
            fontFamily: 'Inter, sans-serif', fontSize: '13px',
            color: '#6b6560', marginTop: '8px',
          }}>{user.email}</p>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px' }}>
        {/* Stats */}
        <div className="anim stats-3col">
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
                  <div key={p.movieId} className="purchase-row">
                    {/* Mini poster */}
                    <div style={{
                      width: '100%', height: '72px', flexShrink: 0,
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
                        {' '}· <span style={{ color: '#c9a227' }}>${p.amount}</span>
                      </p>
                    </div>

                    <span className="purchase-row-amount" style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '20px', color: '#c9a227',
                    }}>${p.amount}</span>

                    <div className="purchase-row-actions">
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
