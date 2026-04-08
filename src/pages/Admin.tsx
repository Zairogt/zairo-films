import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { MOVIES } from '../data/movies'
import type { Movie } from '../data/movies'

type Tab = 'dashboard' | 'movies' | 'orders' | 'users' | 'analytics'

const MOCK_ORDERS = [
  { id: 'ord_001', user: 'maria@example.com', movie: 'Aquí Me Quedo', tier: 'watch', amount: 10, date: '2024-11-03' },
  { id: 'ord_002', user: 'carlos@example.com', movie: 'Hostal Don Tulio', tier: 'download', amount: 20, date: '2024-11-08' },
  { id: 'ord_003', user: 'ana@example.com', movie: 'POL: Odisea en la USAC', tier: 'watch', amount: 10, date: '2024-11-15' },
  { id: 'ord_004', user: 'pedro@example.com', movie: 'Otros 4 Litros', tier: 'download', amount: 20, date: '2024-11-22' },
  { id: 'ord_005', user: 'lucia@example.com', movie: 'Bajo el Sol de Septiembre', tier: 'watch', amount: 10, date: '2024-12-01' },
  { id: 'ord_006', user: 'jorge@example.com', movie: 'CARGAM: Gestores Culturales', tier: 'watch', amount: 10, date: '2024-12-10' },
  { id: 'ord_007', user: 'sofia@example.com', movie: 'Making Of: Un Detrás de Cámaras', tier: 'download', amount: 20, date: '2024-12-18' },
  { id: 'ord_008', user: 'luis@example.com', movie: 'Aquí Me Quedo', tier: 'download', amount: 20, date: '2025-01-05' },
  { id: 'ord_009', user: 'maria@example.com', movie: 'Otros 4 Litros', tier: 'watch', amount: 10, date: '2025-01-14' },
  { id: 'ord_010', user: 'ana@example.com', movie: 'Bajo el Sol de Septiembre', tier: 'download', amount: 20, date: '2025-01-20' },
  { id: 'ord_011', user: 'roberto@example.com', movie: 'Bajo el Sol de Septiembre', tier: 'watch', amount: 10, date: '2025-02-03' },
  { id: 'ord_012', user: 'karen@example.com', movie: 'Bajo el Sol de Septiembre', tier: 'download', amount: 20, date: '2025-02-11' },
]

const MOCK_USERS = [
  { id: 'usr_001', email: 'maria@example.com', name: 'María López', joined: '2024-10-28', orders: 2, total: 20 },
  { id: 'usr_002', email: 'carlos@example.com', name: 'Carlos Mendez', joined: '2024-11-01', orders: 1, total: 20 },
  { id: 'usr_003', email: 'ana@example.com', name: 'Ana García', joined: '2024-11-10', orders: 2, total: 30 },
  { id: 'usr_004', email: 'pedro@example.com', name: 'Pedro Ramírez', joined: '2024-11-18', orders: 1, total: 20 },
  { id: 'usr_005', email: 'lucia@example.com', name: 'Lucía Torres', joined: '2024-11-30', orders: 1, total: 10 },
  { id: 'usr_006', email: 'jorge@example.com', name: 'Jorge Castillo', joined: '2024-12-05', orders: 1, total: 10 },
  { id: 'usr_007', email: 'sofia@example.com', name: 'Sofía Herrera', joined: '2024-12-12', orders: 1, total: 20 },
  { id: 'usr_008', email: 'luis@example.com', name: 'Luis Ajú', joined: '2024-12-28', orders: 1, total: 20 },
  { id: 'usr_009', email: 'roberto@example.com', name: 'Roberto Caal', joined: '2025-01-15', orders: 1, total: 10 },
  { id: 'usr_010', email: 'karen@example.com', name: 'Karen Soto', joined: '2025-02-01', orders: 1, total: 20 },
]

const MONTHLY_REVENUE = [
  { month: 'Oct', revenue: 0 },
  { month: 'Nov', revenue: 60 },
  { month: 'Dic', revenue: 40 },
  { month: 'Ene', revenue: 60 },
  { month: 'Feb', revenue: 30 },
]

const RETENTION_DATA = [
  { id: '1', title: 'Bajo el Sol de Septiembre', retention: 81, dropoff: 64, trailerViews: 312, detailViews: 148, purchases: 4, featured: true },
  { id: '2', title: 'Aquí Me Quedo', retention: 74, dropoff: 49, trailerViews: 198, detailViews: 89, purchases: 3 },
  { id: '3', title: 'POL: Odisea en la USAC', retention: 88, dropoff: 71, trailerViews: 241, detailViews: 102, purchases: 1 },
  { id: '4', title: 'Otros 4 Litros', retention: 77, dropoff: 58, trailerViews: 175, detailViews: 78, purchases: 2 },
  { id: '5', title: 'Hostal Don Tulio', retention: 69, dropoff: 42, trailerViews: 143, detailViews: 61, purchases: 2 },
  { id: '6', title: 'CARGAM: Gestores Culturales', retention: 63, dropoff: 33, trailerViews: 97, detailViews: 38, purchases: 1 },
  { id: '7', title: 'Making Of: Un Detrás de Cámaras', retention: 71, dropoff: 52, trailerViews: 129, detailViews: 55, purchases: 1 },
]

const TRAFFIC_SOURCES = [
  { source: 'Instagram', visits: 487, pct: 42 },
  { source: 'Directo', visits: 231, pct: 20 },
  { source: 'WhatsApp', visits: 196, pct: 17 },
  { source: 'Facebook', visits: 138, pct: 12 },
  { source: 'Otros', visits: 104, pct: 9 },
]

const DEVICES = [
  { device: 'Móvil', pct: 68 },
  { device: 'Desktop', pct: 24 },
  { device: 'Tablet', pct: 8 },
]

const cell: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif', fontSize: '9px',
  fontWeight: 500, letterSpacing: '0.15em',
  textTransform: 'uppercase', color: '#3d3a35',
}

const label12: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif', fontSize: '10px',
  fontWeight: 500, letterSpacing: '0.2em',
  textTransform: 'uppercase', color: '#c9a227', marginBottom: '24px',
}

function downloadCSV(filename: string, headers: string, rows: string[]) {
  const blob = new Blob([headers + '\n' + rows.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function exportCSV(data: typeof MOCK_ORDERS) {
  downloadCSV(
    'zairo-films-ordenes.csv',
    'ID,Usuario,Película,Tipo,Monto,Fecha',
    data.map(o => `${o.id},${o.user},"${o.movie}",${o.tier === 'download' ? 'Descarga' : 'Ver'},$${o.amount},${o.date}`)
  )
}

function exportRetention() {
  downloadCSV(
    'zairo-films-retencion.csv',
    'Película,Retención %,Min Abandono,Trailer Vistas,Detalle Vistas,Compras',
    RETENTION_DATA.map(m => `"${m.title}",${m.retention}%,${m.dropoff},${m.trailerViews},${m.detailViews},${m.purchases}`)
  )
}

function exportTraffic() {
  downloadCSV(
    'zairo-films-trafico.csv',
    'Fuente,Visitas,Porcentaje',
    TRAFFIC_SOURCES.map(s => `${s.source},${s.visits},${s.pct}%`)
  )
}

function exportRevenue(data: typeof MONTHLY_REVENUE) {
  downloadCSV(
    'zairo-films-ingresos.csv',
    'Mes,Ingresos',
    data.map(m => `${m.month},$${m.revenue}`)
  )
}

function exportAllJSON() {
  const payload = {
    exportDate: new Date().toISOString(),
    ingresos: MONTHLY_REVENUE,
    retencion: RETENTION_DATA,
    trafico: TRAFFIC_SOURCES,
    ordenes: MOCK_ORDERS,
    usuarios: MOCK_USERS,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'zairo-films-datos-completos.json'; a.click()
  URL.revokeObjectURL(url)
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)', padding: '24px' }}>
      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '38px', fontWeight: 300, color: '#c9a227', lineHeight: 1 }}>{value}</div>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#6b6560', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '8px' }}>{label}</div>
      {sub && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#3d3a35', marginTop: '4px' }}>{sub}</div>}
    </div>
  )
}

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [orderFilter, setOrderFilter] = useState<'all' | 'watch' | 'download'>('all')
  const [hoveredBar, setHoveredBar] = useState<string | null>(null)
  const [selectedMovie, setSelectedMovie] = useState<string | null>(null)
  const [period, setPeriod] = useState<'all' | '3m' | '1m'>('all')
  const [localMovies, setLocalMovies] = useState<Movie[]>(MOVIES)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Movie>>({})
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [posterPreview, setPosterPreview] = useState<string | null>(null)

  if (!user?.isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: 300, color: '#e8e3d9' }}>Acceso restringido</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6b6560', marginTop: '8px' }}>
            Inicia sesión con <span style={{ color: '#c9a227' }}>admin@zairofilms.com</span> para acceder
          </p>
          <button className="btn-outline" style={{ marginTop: '24px' }} onClick={() => navigate('/login')}>Ir al login</button>
        </div>
      </div>
    )
  }

  const filteredOrders = orderFilter === 'all' ? MOCK_ORDERS : MOCK_ORDERS.filter(o => o.tier === orderFilter)
  const totalRevenue = MOCK_ORDERS.reduce((s, o) => s + o.amount, 0)
  const featuredMovie = RETENTION_DATA.find(m => m.featured)!

  const movieSales: Record<string, { count: number; revenue: number }> = {}
  MOCK_ORDERS.forEach(o => {
    if (!movieSales[o.movie]) movieSales[o.movie] = { count: 0, revenue: 0 }
    movieSales[o.movie].count++
    movieSales[o.movie].revenue += o.amount
  })
  const topMovies = Object.entries(movieSales).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5)

  const TABS: [Tab, string][] = [
    ['dashboard', 'Dashboard'],
    ['movies', 'Películas'],
    ['orders', 'Pedidos'],
    ['users', 'Usuarios'],
    ['analytics', 'Analytics'],
  ]

  return (
    <div style={{ minHeight: '100vh', paddingTop: '72px' }}>
      {/* Header */}
      <div style={{ padding: '40px 48px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', background: '#0a0a0a' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
            <div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#c9a227' }}>Panel de administración</span>
              <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', fontWeight: 300, color: '#e8e3d9', marginTop: '8px' }}>Zairo Films · Admin</h1>
            </div>
            <div style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)', padding: '12px 20px', fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#c9a227', letterSpacing: '0.08em' }}>
              {user.email}
            </div>
          </div>
          <div style={{ display: 'flex' }}>
            {TABS.map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: 'transparent', border: 'none',
                borderBottom: `2px solid ${tab === t ? '#c9a227' : 'transparent'}`,
                color: tab === t ? '#e8e3d9' : '#6b6560',
                fontFamily: 'Inter, sans-serif', fontSize: '11px',
                fontWeight: tab === t ? 500 : 400,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                padding: '12px 24px', cursor: 'pointer', transition: 'all 0.2s',
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>

        {/* ── DASHBOARD TAB ── */}
        {tab === 'dashboard' && (
          <div>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
              <StatCard label="Ingresos totales" value={`$${totalRevenue}`} />
              <StatCard label="Órdenes" value={`${MOCK_ORDERS.length}`} sub={`$${(totalRevenue / MOCK_ORDERS.length).toFixed(0)} promedio`} />
              <StatCard label="Usuarios" value={`${MOCK_USERS.length}`} />
              <StatCard label="Películas" value={`${MOVIES.length}`} />
            </div>

            {/* Featured movie highlight */}
            <div style={{ background: 'linear-gradient(135deg, #1a1208 0%, #2e1f08 60%, #0e0e0e 100%)', border: '1px solid rgba(201,162,39,0.25)', padding: '32px', marginBottom: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, #c9a227, transparent)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a227' }}>En promoción activa</span>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c9a227', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                  </div>
                  <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: 300, color: '#e8e3d9', marginBottom: '4px' }}>
                    {featuredMovie.title}
                  </h2>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6b6560' }}>Película destacada · Seguimiento prioritario</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                  {[
                    ['Vistas trailer', featuredMovie.trailerViews],
                    ['Visitas detalle', featuredMovie.detailViews],
                    ['Compras', featuredMovie.purchases],
                    ['Retención', `${featuredMovie.retention}%`],
                  ].map(([l, v]) => (
                    <div key={String(l)} style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', color: '#c9a227' }}>{v}</div>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: '#6b6560', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Mini funnel */}
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: '#6b6560', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>Embudo de conversión</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {[
                    { label: 'Trailer', value: featuredMovie.trailerViews },
                    { label: 'Detalle', value: featuredMovie.detailViews },
                    { label: 'Compra', value: featuredMovie.purchases },
                  ].map((step, i, arr) => (
                    <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#9e9890' }}>{step.label}</span>
                          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '14px', color: '#c9a227' }}>{step.value}</span>
                        </div>
                        <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                          <div style={{ height: '100%', width: `${(step.value / arr[0].value) * 100}%`, background: '#c9a227', borderRadius: '2px' }} />
                        </div>
                        {i > 0 && (
                          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: '#3d3a35', marginTop: '3px' }}>
                            {((step.value / arr[i - 1].value) * 100).toFixed(0)}% del paso anterior
                          </div>
                        )}
                      </div>
                      {i < arr.length - 1 && <span style={{ color: '#3d3a35', fontSize: '12px' }}>›</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top películas + actividad reciente */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)', padding: '28px' }}>
                <p style={label12}>Top películas</p>
                {topMovies.map(([title, data], i) => (
                  <div key={title} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#3d3a35', width: '18px' }}>{i + 1}</span>
                    <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '15px', color: '#e8e3d9', flex: 1 }}>{title}</span>
                    <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', color: '#c9a227' }}>${data.revenue}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)', padding: '28px' }}>
                <p style={label12}>Actividad reciente</p>
                {MOCK_ORDERS.slice(-5).reverse().map(o => (
                  <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <div>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9e9890' }}>{o.user}</p>
                      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '13px', color: '#6b6560', marginTop: '2px' }}>{o.movie}</p>
                    </div>
                    <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: '#c9a227' }}>${o.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── MOVIES TAB ── */}
        {tab === 'movies' && (() => {
          const startEdit = (m: Movie) => {
            setEditingId(m.id)
            setEditForm({ ...m })
            setPosterPreview(null)
          }
          const saveEdit = () => {
            setLocalMovies(prev => prev.map(m => m.id === editingId ? { ...m, ...editForm } as Movie : m))
            setEditingId(null)
            setPosterPreview(null)
          }
          const cancelEdit = () => { setEditingId(null); setPosterPreview(null) }
          const confirmDelete = (id: string) => setDeletingId(id)
          const doDelete = () => {
            setLocalMovies(prev => prev.filter(m => m.id !== deletingId))
            setDeletingId(null)
          }
          const handlePoster = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = ev => {
              const result = ev.target?.result as string
              setPosterPreview(result)
              setEditForm(f => ({ ...f, poster_url: result }))
            }
            reader.readAsDataURL(file)
          }
          const addNew = () => {
            const newMovie: Movie = {
              id: `new_${Date.now()}`,
              title: 'Nueva Película',
              sinopsis: '',
              tagline: '',
              year: new Date().getFullYear(),
              duration: '0h 00min',
              genre: 'Drama',
              director: 'Rodolfo Espinoza Orantes',
              poster_url: '',
              backdrop: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
              trailer_url: '',
              video_url: '',
              precio_ver: 10,
              precio_descargar: 20,
            }
            setLocalMovies(prev => [newMovie, ...prev])
            startEdit(newMovie)
          }

          return (
            <div>
              {/* Modal confirmación eliminar */}
              {deletingId && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ background: '#0e0e0e', border: '1px solid rgba(192,57,43,0.3)', padding: '40px', maxWidth: '400px', width: '90%' }}>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', fontWeight: 300, color: '#e8e3d9', marginBottom: '12px' }}>¿Eliminar película?</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6b6560', marginBottom: '28px', lineHeight: 1.6 }}>
                      Esta acción no se puede deshacer en demo. Con base de datos real se podría archivar en vez de eliminar.
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={doDelete} style={{ background: 'rgba(192,57,43,0.15)', border: '1px solid rgba(192,57,43,0.4)', color: '#c0392b', fontFamily: 'Inter, sans-serif', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '10px 24px', cursor: 'pointer', transition: 'all 0.2s' }}>
                        Eliminar
                      </button>
                      <button onClick={() => setDeletingId(null)} className="btn-ghost">Cancelar</button>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6b6560' }}>{localMovies.length} películas en catálogo</p>
                <button className="btn-primary" style={{ padding: '10px 24px', fontSize: '10px' }} onClick={addNew}>
                  + Nueva película
                </button>
              </div>

              <div style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '40px 60px 1fr 80px 100px 100px 100px', gap: '16px', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {['#', 'Poster', 'Título', 'Año', 'Ver $', 'Desc. $', ''].map(h => <span key={h} style={cell}>{h}</span>)}
                </div>

                {localMovies.map((m, i) => {
                  const isEditing = editingId === m.id
                  const isFeatured = m.featured

                  return (
                    <div key={m.id}>
                      {/* Fila normal */}
                      <div style={{ display: 'grid', gridTemplateColumns: '40px 60px 1fr 80px 100px 100px 100px', gap: '16px', padding: '12px 20px', alignItems: 'center', borderBottom: isEditing ? 'none' : '1px solid rgba(255,255,255,0.03)', background: isEditing ? 'rgba(201,162,39,0.04)' : isFeatured ? 'rgba(201,162,39,0.02)' : 'transparent' }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#3d3a35' }}>{String(i + 1).padStart(2, '0')}</span>

                        {/* Mini poster */}
                        <div style={{ width: '40px', height: '56px', overflow: 'hidden', borderRadius: '2px', background: '#1a1a1a', flexShrink: 0 }}>
                          {m.poster_url
                            ? <img src={m.poster_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🎬</div>
                          }
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', color: '#e8e3d9' }}>{m.title}</p>
                            {isFeatured && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9a227', border: '1px solid rgba(201,162,39,0.4)', padding: '2px 6px' }}>Destacada</span>}
                          </div>
                          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#6b6560', marginTop: '2px' }}>{m.genre} · {m.duration}</p>
                        </div>

                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#9e9890' }}>{m.year}</span>
                        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', color: '#c9a227' }}>${m.precio_ver}</span>
                        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', color: '#c9a227' }}>${m.precio_descargar}</span>

                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button title="Editar" onClick={() => isEditing ? cancelEdit() : startEdit(m)}
                            style={{ background: isEditing ? 'rgba(201,162,39,0.12)' : 'transparent', border: `1px solid ${isEditing ? 'rgba(201,162,39,0.3)' : 'transparent'}`, color: isEditing ? '#c9a227' : '#6b6560', cursor: 'pointer', fontSize: '13px', padding: '4px 8px', transition: 'all 0.2s', borderRadius: '2px' }}
                            onMouseEnter={e => { if (!isEditing) e.currentTarget.style.color = '#e8e3d9' }}
                            onMouseLeave={e => { if (!isEditing) e.currentTarget.style.color = '#6b6560' }}>✎</button>
                          <button title="Eliminar" onClick={() => confirmDelete(m.id)}
                            style={{ background: 'transparent', border: '1px solid transparent', color: '#6b6560', cursor: 'pointer', fontSize: '13px', padding: '4px 8px', transition: 'all 0.2s', borderRadius: '2px' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#c0392b'; e.currentTarget.style.borderColor = 'rgba(192,57,43,0.3)' }}
                            onMouseLeave={e => { e.currentTarget.style.color = '#6b6560'; e.currentTarget.style.borderColor = 'transparent' }}>✕</button>
                        </div>
                      </div>

                      {/* Panel de edición expandible */}
                      {isEditing && (
                        <div style={{ background: '#111', borderBottom: '1px solid rgba(201,162,39,0.15)', padding: '28px 24px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '24px' }}>

                            {/* Poster upload */}
                            <div>
                              <div style={{ width: '100%', aspectRatio: '2/3', background: '#0e0e0e', border: '1px dashed rgba(255,255,255,0.1)', overflow: 'hidden', borderRadius: '2px', marginBottom: '8px', position: 'relative' }}>
                                {(posterPreview || editForm.poster_url)
                                  ? <img src={posterPreview || editForm.poster_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
                                      <span style={{ fontSize: '24px' }}>🎬</span>
                                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: '#3d3a35', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sin poster</span>
                                    </div>
                                }
                              </div>
                              <label style={{ display: 'block', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9a227', cursor: 'pointer', padding: '6px', border: '1px solid rgba(201,162,39,0.2)', transition: 'all 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,162,39,0.08)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                ↑ Subir imagen
                                <input type="file" accept="image/*" onChange={handlePoster} style={{ display: 'none' }} />
                              </label>
                              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: '#3d3a35', marginTop: '6px', textAlign: 'center', lineHeight: 1.5 }}>JPG, PNG · Recomendado 400×600px</p>
                            </div>

                            {/* Campos */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignContent: 'start' }}>
                              {([
                                ['Título', 'title', 'text'],
                                ['Género', 'genre', 'text'],
                                ['Año', 'year', 'number'],
                                ['Duración', 'duration', 'text'],
                                ['Precio Ver ($)', 'precio_ver', 'number'],
                                ['Precio Descargar ($)', 'precio_descargar', 'number'],
                                ['URL Trailer', 'trailer_url', 'url'],
                                ['URL Video', 'video_url', 'url'],
                              ] as const).map(([lbl, key, type]) => (
                                <div key={key}>
                                  <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6b6560', display: 'block', marginBottom: '6px' }}>{lbl}</label>
                                  <input className="input-field" type={type}
                                    value={String(editForm[key as keyof Movie] ?? '')}
                                    onChange={e => setEditForm(f => ({ ...f, [key]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                                    style={{ fontSize: '12px', padding: '6px 0' }} />
                                </div>
                              ))}

                              <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6b6560', display: 'block', marginBottom: '6px' }}>Tagline</label>
                                <input className="input-field" type="text"
                                  value={editForm.tagline ?? ''}
                                  onChange={e => setEditForm(f => ({ ...f, tagline: e.target.value }))}
                                  style={{ fontSize: '12px', padding: '6px 0' }} />
                              </div>

                              <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6b6560', display: 'block', marginBottom: '6px' }}>Sinopsis</label>
                                <textarea
                                  value={editForm.sinopsis ?? ''}
                                  onChange={e => setEditForm(f => ({ ...f, sinopsis: e.target.value }))}
                                  rows={3}
                                  style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.12)', color: '#e8e3d9', fontFamily: 'Inter, sans-serif', fontSize: '12px', fontWeight: 300, width: '100%', resize: 'vertical', outline: 'none', padding: '6px 0' }}
                                />
                              </div>

                              {/* Toggle destacada */}
                              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '4px' }}>
                                <button onClick={() => setEditForm(f => ({ ...f, featured: !f.featured }))}
                                  style={{ width: '40px', height: '22px', borderRadius: '11px', border: 'none', background: editForm.featured ? '#c9a227' : 'rgba(255,255,255,0.1)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                                  <span style={{ position: 'absolute', top: '3px', left: editForm.featured ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                                </button>
                                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9e9890' }}>Marcar como película destacada en el inicio</span>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                            <button className="btn-primary" onClick={saveEdit} style={{ padding: '10px 28px', fontSize: '10px' }}>
                              Guardar cambios
                            </button>
                            <button className="btn-ghost" onClick={cancelEdit}>Cancelar</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}

        {/* ── ORDERS TAB ── */}
        {tab === 'orders' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {([['all', 'Todos'], ['watch', 'Ver'], ['download', 'Descarga']] as const).map(([val, lbl]) => (
                  <button key={val} onClick={() => setOrderFilter(val)} style={{
                    background: orderFilter === val ? 'rgba(201,162,39,0.12)' : 'transparent',
                    border: `1px solid ${orderFilter === val ? 'rgba(201,162,39,0.4)' : 'rgba(255,255,255,0.06)'}`,
                    color: orderFilter === val ? '#c9a227' : '#6b6560',
                    fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '0.1em',
                    textTransform: 'uppercase', padding: '6px 16px', cursor: 'pointer', transition: 'all 0.2s',
                  }}>{lbl}</button>
                ))}
              </div>
              <button onClick={() => exportCSV(filteredOrders)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#9e9890', fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '6px 16px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#e8e3d9'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#9e9890'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}>
                ↓ Exportar CSV
              </button>
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6b6560', marginBottom: '16px' }}>{filteredOrders.length} órdenes</p>
            <div style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 80px 80px 100px', gap: '16px', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {['ID', 'Usuario', 'Película', 'Tipo', 'Monto', 'Fecha'].map(h => <span key={h} style={cell}>{h}</span>)}
              </div>
              {filteredOrders.map(o => (
                <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 80px 80px 100px', gap: '16px', padding: '16px 20px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#6b6560', letterSpacing: '0.05em' }}>{o.id}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#9e9890' }}>{o.user}</span>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '15px', color: '#e8e3d9' }}>{o.movie}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: o.tier === 'download' ? '#c9a227' : '#8b7355', letterSpacing: '0.05em' }}>
                    {o.tier === 'download' ? 'Desc.' : 'Ver'}
                  </span>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: '#c9a227' }}>${o.amount}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6b6560' }}>{o.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── USERS TAB ── */}
        {tab === 'users' && (
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6b6560', marginBottom: '24px' }}>{MOCK_USERS.length} usuarios registrados</p>
            <div style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 80px 80px 100px', gap: '16px', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {['ID', 'Nombre', 'Email', 'Compras', 'Total', 'Desde'].map(h => <span key={h} style={cell}>{h}</span>)}
              </div>
              {MOCK_USERS.map(u => (
                <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 80px 80px 100px', gap: '16px', padding: '16px 20px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#6b6560', letterSpacing: '0.05em' }}>{u.id}</span>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '15px', color: '#e8e3d9' }}>{u.name}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9e9890' }}>{u.email}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#9e9890', textAlign: 'center' }}>{u.orders}</span>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: '#c9a227' }}>${u.total}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6b6560' }}>{u.joined}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {tab === 'analytics' && (() => {
          const filteredRevenue = period === '1m'
            ? MONTHLY_REVENUE.slice(-1)
            : period === '3m'
            ? MONTHLY_REVENUE.slice(-3)
            : MONTHLY_REVENUE
          const filtMax = Math.max(...filteredRevenue.map(m => m.revenue))
          const filtTotal = filteredRevenue.reduce((s, m) => s + m.revenue, 0)
          const expandedMovie = selectedMovie ? RETENTION_DATA.find(m => m.id === selectedMovie) : null

          return (
            <div>
              {/* Export all */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                <button onClick={exportAllJSON} style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.3)', color: '#c9a227', fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 20px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,162,39,0.16)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,162,39,0.08)' }}>
                  ↓ Exportar todo (JSON)
                </button>
              </div>

              {/* Monthly chart */}
              <div style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)', padding: '32px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <p style={{ ...label12, marginBottom: 0 }}>Ingresos por mes</p>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {([['all', 'Todo'], ['3m', '3 meses'], ['1m', 'Este mes']] as const).map(([val, lbl]) => (
                      <button key={val} onClick={() => setPeriod(val)} style={{ background: period === val ? 'rgba(201,162,39,0.12)' : 'transparent', border: `1px solid ${period === val ? 'rgba(201,162,39,0.4)' : 'rgba(255,255,255,0.06)'}`, color: period === val ? '#c9a227' : '#6b6560', fontFamily: 'Inter, sans-serif', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', cursor: 'pointer', transition: 'all 0.2s' }}>{lbl}</button>
                    ))}
                    <button onClick={() => exportRevenue(filteredRevenue)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#6b6560', fontFamily: 'Inter, sans-serif', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', cursor: 'pointer', marginLeft: '8px', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#e8e3d9' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#6b6560' }}>↓ CSV</button>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '140px', position: 'relative' }}>
                  {filteredRevenue.map(({ month, revenue }) => {
                    const isHovered = hoveredBar === month
                    return (
                      <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end', position: 'relative', cursor: 'pointer' }}
                        onMouseEnter={() => setHoveredBar(month)}
                        onMouseLeave={() => setHoveredBar(null)}>
                        {/* Tooltip */}
                        {isHovered && revenue > 0 && (
                          <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', background: '#1a1a1a', border: '1px solid rgba(201,162,39,0.3)', padding: '8px 12px', marginBottom: '4px', whiteSpace: 'nowrap', zIndex: 10 }}>
                            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: '#c9a227' }}>${revenue}</div>
                            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: '#6b6560', letterSpacing: '0.1em' }}>{((revenue / filtTotal) * 100).toFixed(0)}% del período</div>
                          </div>
                        )}
                        <div style={{ width: '100%', height: `${filtMax > 0 ? (revenue / filtMax) * 100 : 0}px`, minHeight: revenue > 0 ? '4px' : '0', background: isHovered ? '#e8c84a' : 'linear-gradient(to top, #c9a227, rgba(201,162,39,0.4))', borderRadius: '2px 2px 0 0', transition: 'all 0.2s' }} />
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: isHovered ? '#c9a227' : '#6b6560', letterSpacing: '0.1em', transition: 'color 0.2s' }}>{month}</span>
                      </div>
                    )
                  })}
                </div>
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '32px' }}>
                  <div>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', color: '#c9a227' }}>${filtTotal}</div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: '#6b6560', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px' }}>Total período</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', color: '#c9a227' }}>${filteredRevenue.length > 0 ? (filtTotal / filteredRevenue.filter(m => m.revenue > 0).length || 0).toFixed(0) : 0}</div>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: '#6b6560', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px' }}>Promedio mensual</div>
                  </div>
                </div>
              </div>

              {/* Retention per movie — clickable */}
              <div style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)', padding: '32px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <p style={{ ...label12, marginBottom: 0 }}>Retención por película</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#3d3a35' }}>Click en una fila para ver detalle</span>
                    <button onClick={exportRetention} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#6b6560', fontFamily: 'Inter, sans-serif', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#e8e3d9' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#6b6560' }}>↓ CSV</button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 120px 120px 120px 1fr', gap: '16px', padding: '0 0 12px', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {['Retención', 'Trailer', 'Detalle', 'Compras', 'Película'].map(h => <span key={h} style={cell}>{h}</span>)}
                </div>
                {RETENTION_DATA.map(m => {
                  const isSelected = selectedMovie === m.id
                  return (
                    <div key={m.id}>
                      <div onClick={() => setSelectedMovie(isSelected ? null : m.id)}
                        style={{ display: 'grid', gridTemplateColumns: '120px 120px 120px 120px 1fr', gap: '16px', padding: '14px 0', borderBottom: isSelected ? 'none' : '1px solid rgba(255,255,255,0.03)', alignItems: 'center', background: isSelected ? 'rgba(201,162,39,0.05)' : m.featured ? 'rgba(201,162,39,0.02)' : 'transparent', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = m.featured ? 'rgba(201,162,39,0.02)' : 'transparent' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: m.retention >= 80 ? '#c9a227' : '#9e9890' }}>{m.retention}%</span>
                          </div>
                          <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                            <div style={{ height: '100%', width: `${m.retention}%`, background: m.retention >= 80 ? '#c9a227' : '#4a4540', borderRadius: '2px' }} />
                          </div>
                          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: '#3d3a35', marginTop: '3px' }}>Abandono min {m.dropoff}</div>
                        </div>
                        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: '#9e9890' }}>{m.trailerViews}</span>
                        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: '#9e9890' }}>{m.detailViews}</span>
                        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: '#c9a227' }}>{m.purchases}</span>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '15px', color: '#e8e3d9' }}>{m.title}</span>
                            {m.featured && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c9a227', border: '1px solid rgba(201,162,39,0.4)', padding: '2px 6px' }}>Destacada</span>}
                          </div>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#3d3a35' }}>{isSelected ? '▲' : '▼'}</span>
                        </div>
                      </div>

                      {/* Expanded detail */}
                      {isSelected && expandedMovie && (
                        <div style={{ background: '#111', border: '1px solid rgba(201,162,39,0.1)', borderTop: 'none', padding: '20px 24px', marginBottom: '1px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '20px' }}>
                            <div>
                              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: '#6b6560', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>Conversión trailer→compra</div>
                              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', color: '#c9a227' }}>
                                {((expandedMovie.purchases / expandedMovie.trailerViews) * 100).toFixed(1)}%
                              </div>
                            </div>
                            <div>
                              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: '#6b6560', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>Detalle→compra</div>
                              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', color: '#c9a227' }}>
                                {((expandedMovie.purchases / expandedMovie.detailViews) * 100).toFixed(1)}%
                              </div>
                            </div>
                            <div>
                              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: '#6b6560', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '6px' }}>Ingresos generados</div>
                              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', color: '#c9a227' }}>
                                ${movieSales[expandedMovie.title]?.revenue ?? 0}
                              </div>
                            </div>
                          </div>
                          {/* Mini funnel */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {[
                              { label: 'Trailer', value: expandedMovie.trailerViews },
                              { label: 'Detalle', value: expandedMovie.detailViews },
                              { label: 'Compra', value: expandedMovie.purchases },
                            ].map((step, i, arr) => (
                              <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#9e9890' }}>{step.label}</span>
                                    <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '14px', color: '#c9a227' }}>{step.value}</span>
                                  </div>
                                  <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px' }}>
                                    <div style={{ height: '100%', width: `${(step.value / arr[0].value) * 100}%`, background: '#c9a227', borderRadius: '2px' }} />
                                  </div>
                                </div>
                                {i < arr.length - 1 && <span style={{ color: '#3d3a35' }}>›</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Traffic + Devices */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)', padding: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <p style={{ ...label12, marginBottom: 0 }}>Origen de tráfico</p>
                    <button onClick={exportTraffic} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', color: '#6b6560', fontFamily: 'Inter, sans-serif', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#e8e3d9' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#6b6560' }}>↓ CSV</button>
                  </div>
                  {TRAFFIC_SOURCES.map(s => {
                    const isH = hoveredBar === s.source
                    return (
                      <div key={s.source} style={{ marginBottom: '16px', cursor: 'default' }}
                        onMouseEnter={() => setHoveredBar(s.source)}
                        onMouseLeave={() => setHoveredBar(null)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: isH ? '#e8e3d9' : '#9e9890', transition: 'color 0.2s' }}>{s.source}</span>
                          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', color: '#c9a227' }}>{s.pct}%</span>
                        </div>
                        <div style={{ height: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '1px' }}>
                          <div style={{ height: '100%', width: `${s.pct}%`, background: isH ? '#e8c84a' : '#c9a227', borderRadius: '1px', transition: 'background 0.2s' }} />
                        </div>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#3d3a35', marginTop: '3px' }}>{s.visits} visitas</div>
                      </div>
                    )
                  })}
                </div>

                <div style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)', padding: '32px' }}>
                  <p style={label12}>Dispositivos</p>
                  {DEVICES.map(d => (
                    <div key={d.device} style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#9e9890' }}>{d.device}</span>
                        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', color: '#c9a227' }}>{d.pct}%</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
                        <div style={{ height: '100%', width: `${d.pct}%`, background: d.device === 'Móvil' ? '#c9a227' : d.device === 'Desktop' ? '#8b7355' : '#3d3a35', borderRadius: '3px' }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(201,162,39,0.05)', border: '1px solid rgba(201,162,39,0.1)' }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#c9a227', letterSpacing: '0.08em' }}>
                      68% móvil — asegurate que la experiencia móvil sea óptima
                    </p>
                  </div>
                </div>
              </div>

              {/* Top movies */}
              <div style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)', padding: '32px' }}>
                <p style={label12}>Películas más vendidas</p>
                {topMovies.map(([title, data], i) => (
                  <div key={title} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#3d3a35', width: '24px', textAlign: 'center' }}>{String(i + 1).padStart(2, '0')}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', color: '#e8e3d9' }}>{title}</span>
                        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', color: '#c9a227' }}>${data.revenue}</span>
                      </div>
                      <div style={{ height: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '1px' }}>
                        <div style={{ height: '100%', width: `${(data.revenue / topMovies[0][1].revenue) * 100}%`, background: '#c9a227', borderRadius: '1px' }} />
                      </div>
                    </div>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6b6560' }}>{data.count} venta{data.count !== 1 ? 's' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

      </div>
    </div>
  )
}
