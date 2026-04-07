import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MOVIES } from '../data/movies'

type Tab = 'movies' | 'orders' | 'analytics'

const MOCK_ORDERS = [
  { id: 'ord_001', user: 'maria@example.com', movie: 'Xela Insurgente', tier: 'watch', amount: 10, date: '2024-03-15', status: 'Completado' },
  { id: 'ord_002', user: 'carlos@example.com', movie: 'Sueños de Fuego', tier: 'download', amount: 20, date: '2024-03-18', status: 'Completado' },
  { id: 'ord_003', user: 'ana@example.com', movie: 'Tierra Roja', tier: 'watch', amount: 10, date: '2024-03-22', status: 'Completado' },
  { id: 'ord_004', user: 'pedro@example.com', movie: 'Los Últimos Días del Maíz', tier: 'download', amount: 20, date: '2024-03-28', status: 'Completado' },
  { id: 'ord_005', user: 'lucia@example.com', movie: 'Crónicas del Sur', tier: 'watch', amount: 10, date: '2024-04-01', status: 'Completado' },
]

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('movies')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '', sinopsis: '', year: '', duration: '',
    genre: '', precio_ver: '', precio_descargar: '',
    video_url: '', trailer_url: '',
  })

  if (!user?.isAdmin) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: '28px', fontWeight: 300, color: '#e8e3d9',
          }}>Acceso restringido</p>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '12px',
            color: '#6b6560', marginTop: '8px',
          }}>
            Inicia sesión con <span style={{ color: '#c9a227' }}>admin@zairofilms.com</span> para acceder
          </p>
          <button
            className="btn-outline"
            style={{ marginTop: '24px' }}
            onClick={() => navigate('/login')}
          >
            Ir al login
          </button>
        </div>
      </div>
    )
  }

  const totalRevenue = MOCK_ORDERS.reduce((s, o) => s + o.amount, 0)
  const rodolfoShare = (totalRevenue * 0.85).toFixed(2)
  const zairoShare = (totalRevenue * 0.15).toFixed(2)

  return (
    <div style={{ minHeight: '100vh', paddingTop: '72px' }}>
      {/* Header */}
      <div style={{
        padding: '40px 48px 0',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: '#0a0a0a',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
            <div>
              <span style={{
                fontFamily: 'Inter, sans-serif', fontSize: '10px',
                fontWeight: 500, letterSpacing: '0.25em',
                textTransform: 'uppercase', color: '#c9a227',
              }}>Panel de administración</span>
              <h1 style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '36px', fontWeight: 300,
                color: '#e8e3d9', marginTop: '8px',
              }}>Zairo Films · Admin</h1>
            </div>
            <div style={{
              background: 'rgba(201,162,39,0.08)',
              border: '1px solid rgba(201,162,39,0.2)',
              padding: '12px 20px',
              fontFamily: 'Inter, sans-serif', fontSize: '11px',
              color: '#c9a227', letterSpacing: '0.08em',
            }}>
              {user.email}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0' }}>
            {([
              ['movies', 'Películas'],
              ['orders', 'Pedidos'],
              ['analytics', 'Analytics'],
            ] as const).map(([t, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${tab === t ? '#c9a227' : 'transparent'}`,
                  color: tab === t ? '#e8e3d9' : '#6b6560',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '11px', fontWeight: tab === t ? 500 : 400,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>

        {/* MOVIES TAB */}
        {tab === 'movies' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6b6560' }}>
                {MOVIES.length} películas en catálogo
              </p>
              <button
                className="btn-primary"
                style={{ padding: '10px 24px', fontSize: '10px' }}
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? '✕ Cancelar' : '+ Nueva película'}
              </button>
            </div>

            {/* New movie form */}
            {showForm && (
              <div style={{
                background: '#0e0e0e',
                border: '1px solid rgba(201,162,39,0.2)',
                padding: '32px',
                marginBottom: '32px',
              }}>
                <p style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '22px', fontWeight: 300, color: '#e8e3d9',
                  marginBottom: '28px',
                }}>Nueva Película</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>
                  {[
                    ['Título', 'title', 'text'],
                    ['Género', 'genre', 'text'],
                    ['Año', 'year', 'number'],
                    ['Duración', 'duration', 'text'],
                    ['Precio Ver ($)', 'precio_ver', 'number'],
                    ['Precio Descargar ($)', 'precio_descargar', 'number'],
                    ['URL Video', 'video_url', 'url'],
                    ['URL Trailer', 'trailer_url', 'url'],
                  ].map(([label, key, type]) => (
                    <div key={key}>
                      <label style={{
                        fontFamily: 'Inter, sans-serif', fontSize: '10px',
                        letterSpacing: '0.15em', textTransform: 'uppercase',
                        color: '#6b6560', display: 'block', marginBottom: '8px',
                      }}>{label}</label>
                      <input
                        className="input-field"
                        type={type}
                        value={form[key as keyof typeof form]}
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                      />
                    </div>
                  ))}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{
                      fontFamily: 'Inter, sans-serif', fontSize: '10px',
                      letterSpacing: '0.15em', textTransform: 'uppercase',
                      color: '#6b6560', display: 'block', marginBottom: '8px',
                    }}>Sinopsis</label>
                    <textarea
                      value={form.sinopsis}
                      onChange={e => setForm({ ...form, sinopsis: e.target.value })}
                      rows={3}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid rgba(255,255,255,0.12)',
                        color: '#e8e3d9',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '13px', fontWeight: 300,
                        width: '100%', resize: 'vertical',
                        outline: 'none', padding: '8px 0',
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                  <button
                    className="btn-primary"
                    onClick={() => { alert('Película guardada (demo — conectar a Supabase)'); setShowForm(false) }}
                  >
                    Guardar película
                  </button>
                  <button className="btn-ghost" onClick={() => setShowForm(false)}>
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Movies table */}
            <div style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 80px 80px 100px 100px 80px',
                gap: '16px', padding: '12px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                {['#', 'Título', 'Año', 'Dur.', 'Ver', 'Desc.', ''].map(h => (
                  <span key={h} style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '9px',
                    fontWeight: 500, letterSpacing: '0.15em',
                    textTransform: 'uppercase', color: '#3d3a35',
                  }}>{h}</span>
                ))}
              </div>
              {MOVIES.map((m, i) => (
                <div key={m.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr 80px 80px 100px 100px 80px',
                  gap: '16px', padding: '16px 20px', alignItems: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#3d3a35' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', color: '#e8e3d9' }}>{m.title}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#6b6560', marginTop: '2px' }}>{m.genre}</p>
                  </div>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#9e9890' }}>{m.year}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#9e9890' }}>{m.duration}</span>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', color: '#c9a227' }}>${m.precio_ver}</span>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', color: '#c9a227' }}>${m.precio_descargar}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{
                      background: 'transparent', border: 'none',
                      color: '#6b6560', cursor: 'pointer', fontSize: '12px',
                      transition: 'color 0.2s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#e8e3d9')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#6b6560')}
                    >✎</button>
                    <button style={{
                      background: 'transparent', border: 'none',
                      color: '#6b6560', cursor: 'pointer', fontSize: '12px',
                      transition: 'color 0.2s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#c0392b')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#6b6560')}
                    >✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {tab === 'orders' && (
          <div>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: '11px',
              color: '#6b6560', marginBottom: '24px',
            }}>
              {MOCK_ORDERS.length} órdenes totales
            </p>
            <div style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr 1fr 80px 80px 100px',
                gap: '16px', padding: '12px 20px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
                {['ID', 'Usuario', 'Película', 'Tipo', 'Monto', 'Fecha'].map(h => (
                  <span key={h} style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '9px',
                    fontWeight: 500, letterSpacing: '0.15em',
                    textTransform: 'uppercase', color: '#3d3a35',
                  }}>{h}</span>
                ))}
              </div>
              {MOCK_ORDERS.map(o => (
                <div key={o.id} style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 1fr 1fr 80px 80px 100px',
                  gap: '16px', padding: '16px 20px', alignItems: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#6b6560', letterSpacing: '0.05em' }}>
                    {o.id}
                  </span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#9e9890' }}>{o.user}</span>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '15px', color: '#e8e3d9' }}>{o.movie}</span>
                  <span style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '10px',
                    color: o.tier === 'download' ? '#c9a227' : '#8b7355',
                    letterSpacing: '0.05em',
                  }}>
                    {o.tier === 'download' ? 'Desc.' : 'Ver'}
                  </span>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: '#c9a227' }}>${o.amount}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6b6560' }}>{o.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {tab === 'analytics' && (
          <div>
            {/* Revenue cards */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1px', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.04)',
              marginBottom: '40px',
            }}>
              {[
                ['Ingresos totales', `$${totalRevenue}`],
                ['Rodolfo (85%)', `$${rodolfoShare}`],
                ['Zairo (15%)', `$${zairoShare}`],
                ['Usuarios únicos', '5'],
              ].map(([label, val]) => (
                <div key={String(label)} style={{ background: '#0e0e0e', padding: '28px 24px' }}>
                  <div style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '36px', fontWeight: 300, color: '#c9a227',
                  }}>{val}</div>
                  <div style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '10px',
                    color: '#6b6560', letterSpacing: '0.1em',
                    textTransform: 'uppercase', marginTop: '6px',
                  }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Top movies */}
            <div style={{
              background: '#0e0e0e',
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '32px',
            }}>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: '10px',
                fontWeight: 500, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: '#c9a227',
                marginBottom: '24px',
              }}>Películas más vendidas</p>
              {[
                ['Sueños de Fuego', 2, '$40'],
                ['Los Últimos Días del Maíz', 1, '$20'],
                ['Xela Insurgente', 1, '$10'],
                ['Tierra Roja', 1, '$10'],
              ].map(([title, count, revenue], i) => (
                <div key={String(title)} style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '12px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                }}>
                  <span style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '11px',
                    color: '#3d3a35', width: '24px', textAlign: 'center',
                  }}>{String(i + 1).padStart(2, '0')}</span>

                  {/* Bar */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', color: '#e8e3d9' }}>
                        {title}
                      </span>
                      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', color: '#c9a227' }}>
                        {revenue}
                      </span>
                    </div>
                    <div style={{ height: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '1px' }}>
                      <div style={{
                        height: '100%',
                        width: `${(Number(count) / 2) * 100}%`,
                        background: '#c9a227',
                        borderRadius: '1px',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                  </div>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6b6560' }}>
                    {count} venta{Number(count) !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>

            {/* Revenue split visual */}
            <div style={{
              background: '#0e0e0e',
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '32px',
              marginTop: '24px',
            }}>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: '10px',
                fontWeight: 500, letterSpacing: '0.2em',
                textTransform: 'uppercase', color: '#c9a227',
                marginBottom: '24px',
              }}>Distribución de ingresos</p>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', overflow: 'hidden', marginBottom: '16px' }}>
                <div style={{ height: '100%', width: '85%', background: 'linear-gradient(to right, #c9a227, #8b7355)', borderRadius: '4px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ width: '10px', height: '10px', background: '#c9a227', borderRadius: '2px' }} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9e9890' }}>
                    Rodolfo Espinoza — 85% · ${rodolfoShare}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ width: '10px', height: '10px', background: '#3d3a35', borderRadius: '2px' }} />
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6b6560' }}>
                    Zairo Films — 15% · ${zairoShare}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
