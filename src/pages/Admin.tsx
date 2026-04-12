import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { supabase } from '../lib/supabase'
import type { Movie } from '../data/movies'

type Tab = 'dashboard' | 'movies' | 'orders' | 'users' | 'analytics'

type OrderRow = {
  id: string; user: string; movie: string
  tier: 'watch' | 'download'; amount: number; date: string
}
type UserRow = {
  id: string; fullId: string; email: string; name: string
  joined: string; orders: number; total: number
}

const MONTH_NAMES: Record<string, string> = {
  '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
}

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

function exportCSV(data: OrderRow[]) {
  downloadCSV(
    'zairo-films-ordenes.csv',
    'ID,Usuario,Película,Tipo,Monto,Fecha',
    data.map(o => `${o.id},${o.user},"${o.movie}",${o.tier === 'download' ? 'Descarga' : 'Ver'},$${o.amount},${o.date}`)
  )
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
  const { user, loading } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('dashboard')
  const [orderFilter, setOrderFilter] = useState<'all' | 'watch' | 'download'>('all')
  const [hoveredBar, setHoveredBar] = useState<string | null>(null)
  const [period, setPeriod] = useState<'all' | '3m' | '1m'>('all')
  const [localMovies, setLocalMovies] = useState<Movie[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Movie>>({})
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [posterPreview, setPosterPreview] = useState<string | null>(null)
  const [posterUploading, setPosterUploading] = useState(false)
  const [dbOrders, setDbOrders] = useState<OrderRow[]>([])
  const [dbUsers, setDbUsers] = useState<UserRow[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [dataError, setDataError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingUserName, setEditingUserName] = useState('')
  const [savingUserName, setSavingUserName] = useState(false)

  useEffect(() => {
    if (!user?.isAdmin) return
    let cancelled = false
    setDataLoading(true)
    setDataError(false)

    const timeout8s = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 8000)
    )

    Promise.race([
      Promise.all([
        supabase.from('movies').select('*').order('sort_order'),
        supabase.from('movie_secure').select('movie_id, video_url'),
        supabase
          .from('purchases')
          .select('id, tier, amount, created_at, profiles!user_id(name, email), movies!movie_id(title)')
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('id, name, email, created_at, purchases(amount)')
          .order('created_at', { ascending: false }),
      ]),
      timeout8s,
    ])
      .then(([{ data: moviesData }, { data: secureData }, { data: purchasesData }, { data: profilesData }]) => {
        if (cancelled) return

        const secMap: Record<string, string> = {}
        ;(secureData ?? []).forEach((s: any) => { secMap[s.movie_id] = s.video_url })
        setLocalMovies((moviesData ?? []).map((m: any) => ({ ...m, video_url: secMap[m.id] ?? '' })) as Movie[])

        setDbOrders(
          (purchasesData ?? []).map((p: any) => ({
            id: p.id.slice(0, 10),
            user: p.profiles?.email ?? p.profiles?.name ?? '—',
            movie: p.movies?.title ?? '—',
            tier: p.tier as 'watch' | 'download',
            amount: p.amount,
            date: p.created_at.slice(0, 10),
          }))
        )

        setDbUsers(
          (profilesData ?? []).map((u: any) => ({
            id: u.id.slice(0, 10),
            fullId: u.id,
            email: u.email,
            name: u.name,
            joined: u.created_at.slice(0, 10),
            orders: (u.purchases ?? []).length,
            total: (u.purchases ?? []).reduce((s: number, p: any) => s + (p.amount ?? 0), 0),
          }))
        )
      })
      .catch(() => { if (!cancelled) setDataError(true) })
      .finally(() => { if (!cancelled) setDataLoading(false) })

    return () => { cancelled = true }
  }, [user?.id, user?.isAdmin, retryKey])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', fontWeight: 300, fontStyle: 'italic', color: '#3d3a35' }}>
          Cargando…
        </p>
      </div>
    )
  }

  if (!user?.isAdmin) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: 300, color: '#e8e3d9' }}>Acceso restringido</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6b6560', marginTop: '8px' }}>
            Inicia sesión con una cuenta de administrador
          </p>
          <button className="btn-outline" style={{ marginTop: '24px' }} onClick={() => navigate('/login')}>Ir al login</button>
        </div>
      </div>
    )
  }

  if (dataError) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: 300, color: '#e8e3d9' }}>Error al cargar datos</p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6b6560', marginTop: '8px' }}>
            No se pudo conectar con la base de datos. Verifica tu conexión e intenta de nuevo.
          </p>
          <button className="btn-outline" style={{ marginTop: '24px' }} onClick={() => { setDataError(false); setRetryKey(k => k + 1) }}>
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  const handleSaveUserName = async (fullId: string) => {
    const trimmed = editingUserName.trim()
    if (!trimmed) return
    setSavingUserName(true)
    try {
      const { error } = await supabase.from('profiles').update({ name: trimmed }).eq('id', fullId)
      if (error) throw error
      setDbUsers(prev => prev.map(u => u.fullId === fullId ? { ...u, name: trimmed } : u))
      setEditingUserId(null)
      showToast('Nombre actualizado')
    } catch {
      showToast('Error al actualizar nombre')
    } finally {
      setSavingUserName(false)
    }
  }

  const filteredOrders = orderFilter === 'all' ? dbOrders : dbOrders.filter(o => o.tier === orderFilter)
  const totalRevenue = dbOrders.reduce((s, o) => s + o.amount, 0)
  const featuredMovie = localMovies.find(m => m.featured)

  const movieSales: Record<string, { count: number; revenue: number }> = {}
  dbOrders.forEach(o => {
    if (!movieSales[o.movie]) movieSales[o.movie] = { count: 0, revenue: 0 }
    movieSales[o.movie].count++
    movieSales[o.movie].revenue += o.amount
  })
  const topMovies = Object.entries(movieSales).sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5)

  // Ingresos mensuales calculados desde pedidos reales
  const revenueByMonth = (() => {
    const map: Record<string, number> = {}
    dbOrders.forEach(o => {
      const key = o.date.slice(0, 7) // YYYY-MM
      map[key] = (map[key] ?? 0) + o.amount
    })
    return Object.keys(map).sort().map(k => ({
      month: MONTH_NAMES[k.slice(5)] ?? k.slice(5),
      revenue: map[k],
    }))
  })()

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
      <div style={{ padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 48px) 0', borderBottom: '1px solid rgba(255,255,255,0.04)', background: '#0a0a0a' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#c9a227' }}>Panel de administración</span>
              <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 300, color: '#e8e3d9', marginTop: '8px' }}>Zairo Films · Admin</h1>
            </div>
            <div style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)', padding: '10px 16px', fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#c9a227', letterSpacing: '0.08em', alignSelf: 'flex-start' }}>
              {user.email}
            </div>
          </div>
          <div className="admin-tabs" style={{ display: 'flex' }}>
            {TABS.map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)} style={{
                background: 'transparent', border: 'none',
                borderBottom: `2px solid ${tab === t ? '#c9a227' : 'transparent'}`,
                color: tab === t ? '#e8e3d9' : '#6b6560',
                fontFamily: 'Inter, sans-serif', fontSize: '11px',
                fontWeight: tab === t ? 500 : 400,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                padding: '12px 20px', cursor: 'pointer', transition: 'all 0.2s',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 48px)' }}>

        {dataLoading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', fontWeight: 300, fontStyle: 'italic', color: '#3d3a35' }}>
              Cargando panel…
            </p>
          </div>
        )}

        {!dataLoading && <>

        {/* ── DASHBOARD TAB ── */}
        {tab === 'dashboard' && (
          <div>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
              <StatCard label="Ingresos totales" value={`$${totalRevenue}`} />
              <StatCard label="Órdenes" value={`${dbOrders.length}`} sub={dbOrders.length > 0 ? `$${(totalRevenue / dbOrders.length).toFixed(0)} promedio` : undefined} />
              <StatCard label="Usuarios" value={`${dbUsers.length}`} />
              <StatCard label="Películas" value={`${localMovies.length}`} />
            </div>

            {/* Película destacada */}
            {featuredMovie && (
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
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6b6560' }}>{featuredMovie.genre} · {featuredMovie.year}</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                    {([
                      ['Ventas', movieSales[featuredMovie.title]?.count ?? 0],
                      ['Ingresos', `$${movieSales[featuredMovie.title]?.revenue ?? 0}`],
                      ['Precio ver', `$${featuredMovie.precio_ver}`],
                    ] as [string, string | number][]).map(([l, v]) => (
                      <div key={l} style={{ textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', color: '#c9a227' }}>{v}</div>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: '#6b6560', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Top películas + actividad reciente */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)', padding: '28px' }}>
                <p style={label12}>Top películas</p>
                {topMovies.length === 0 ? (
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#3d3a35', fontStyle: 'italic' }}>Sin ventas aún</p>
                ) : topMovies.map(([title, data], i) => (
                  <div key={title} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#3d3a35', width: '18px' }}>{i + 1}</span>
                    <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '15px', color: '#e8e3d9', flex: 1 }}>{title}</span>
                    <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '16px', color: '#c9a227' }}>${data.revenue}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)', padding: '28px' }}>
                <p style={label12}>Actividad reciente</p>
                {dbOrders.length === 0 ? (
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#3d3a35', fontStyle: 'italic' }}>Sin actividad aún</p>
                ) : dbOrders.slice(0, 5).map(o => (
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
          const saveEdit = async () => {
            if (!editingId) return
            const { video_url, sort_order, created_at, id: _id, ...movieData } = editForm as Movie
            await supabase.from('movies').upsert({ id: editingId, ...movieData })
            if (video_url !== undefined) {
              await supabase.from('movie_secure').upsert({ movie_id: editingId, video_url })
            }
            setLocalMovies(prev => prev.map(m => m.id === editingId ? { ...m, ...editForm } as Movie : m))
            setEditingId(null)
            setPosterPreview(null)
            showToast('Cambios guardados')
          }
          const cancelEdit = () => { setEditingId(null); setPosterPreview(null) }
          const confirmDelete = (id: string) => setDeletingId(id)
          const doDelete = async () => {
            if (!deletingId) return
            await supabase.from('movies').delete().eq('id', deletingId)
            setLocalMovies(prev => prev.filter(m => m.id !== deletingId))
            setDeletingId(null)
          }
          const handlePoster = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0]
            if (!file || !editingId) return
            setPosterUploading(true)
            try {
              const ext = file.name.split('.').pop() ?? 'jpg'
              const path = `${editingId}.${ext}`
              const { error } = await supabase.storage
                .from('posters')
                .upload(path, file, { upsert: true })
              if (error) throw error
              const { data: { publicUrl } } = supabase.storage
                .from('posters')
                .getPublicUrl(path)
              setPosterPreview(publicUrl)
              setEditForm(f => ({ ...f, poster_url: publicUrl }))
            } catch {
              showToast('Error al subir imagen', 'error')
            } finally {
              setPosterUploading(false)
            }
          }
          const addNew = async () => {
            const { data: newMovie } = await supabase
              .from('movies')
              .insert({
                title: 'Nueva Película',
                year: new Date().getFullYear(),
                duration: '0h 00min',
                genre: 'Drama',
                director: 'Rodolfo Espinosa Orantes',
                backdrop: 'linear-gradient(135deg, #111 0%, #1a1a1a 100%)',
                precio_ver: 10,
                precio_descargar: 20,
              })
              .select()
              .single()
            if (newMovie) {
              const m = { ...newMovie, video_url: '' } as Movie
              setLocalMovies(prev => [m, ...prev])
              startEdit(m)
            }
          }

          return (
            <div>
              {/* Modal confirmación eliminar */}
              {deletingId && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ background: '#0e0e0e', border: '1px solid rgba(192,57,43,0.3)', padding: '40px', maxWidth: '400px', width: '90%' }}>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', fontWeight: 300, color: '#e8e3d9', marginBottom: '12px' }}>¿Eliminar película?</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6b6560', marginBottom: '28px', lineHeight: 1.6 }}>
                      Esta acción eliminará la película permanentemente del catálogo.
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
                      {/* Fila */}
                      <div style={{ display: 'grid', gridTemplateColumns: '40px 60px 1fr 80px 100px 100px 100px', gap: '16px', padding: '12px 20px', alignItems: 'center', borderBottom: isEditing ? 'none' : '1px solid rgba(255,255,255,0.03)', background: isEditing ? 'rgba(201,162,39,0.04)' : isFeatured ? 'rgba(201,162,39,0.02)' : 'transparent' }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#3d3a35' }}>{String(i + 1).padStart(2, '0')}</span>

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

                      {/* Panel de edición */}
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
                              <label style={{ display: 'block', textAlign: 'center', fontFamily: 'Inter, sans-serif', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: posterUploading ? '#6b6560' : '#c9a227', cursor: posterUploading ? 'not-allowed' : 'pointer', padding: '6px', border: '1px solid rgba(201,162,39,0.2)', transition: 'all 0.2s', opacity: posterUploading ? 0.6 : 1 }}
                                onMouseEnter={e => { if (!posterUploading) e.currentTarget.style.background = 'rgba(201,162,39,0.08)' }}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                {posterUploading ? 'Subiendo…' : '↑ Subir imagen'}
                                <input type="file" accept="image/*" onChange={handlePoster} disabled={posterUploading} style={{ display: 'none' }} />
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
            <div className="admin-table-wrap">
            <div style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)', minWidth: '640px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 80px 80px 100px', gap: '16px', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {['ID', 'Usuario', 'Película', 'Tipo', 'Monto', 'Fecha'].map(h => <span key={h} style={cell}>{h}</span>)}
              </div>
              {filteredOrders.length === 0 ? (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#3d3a35', fontStyle: 'italic', padding: '24px 20px' }}>Sin órdenes aún</p>
              ) : filteredOrders.map(o => (
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
            </div>{/* /admin-table-wrap orders */}
          </div>
        )}

        {/* ── USERS TAB ── */}
        {tab === 'users' && (
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6b6560', marginBottom: '24px' }}>{dbUsers.length} usuarios registrados</p>
            <div className="admin-table-wrap">
            <div style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)', minWidth: '640px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 80px 80px 100px', gap: '16px', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {['ID', 'Nombre', 'Email', 'Compras', 'Total', 'Desde'].map(h => <span key={h} style={cell}>{h}</span>)}
              </div>
              {dbUsers.length === 0 ? (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#3d3a35', fontStyle: 'italic', padding: '24px 20px' }}>Sin usuarios aún</p>
              ) : dbUsers.map(u => (
                <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 80px 80px 100px', gap: '16px', padding: '16px 20px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#6b6560', letterSpacing: '0.05em' }}>{u.id}</span>

                  {/* Nombre editable por admin */}
                  {editingUserId === u.fullId ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        autoFocus
                        value={editingUserName}
                        onChange={e => setEditingUserName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSaveUserName(u.fullId)
                          if (e.key === 'Escape') setEditingUserId(null)
                        }}
                        style={{
                          fontFamily: 'Cormorant Garamond, serif', fontSize: '15px',
                          color: '#e8e3d9', background: 'transparent',
                          border: 'none', borderBottom: '1px solid rgba(201,162,39,0.4)',
                          outline: 'none', padding: '0 2px 2px', width: '120px',
                        }}
                      />
                      <button
                        onClick={() => handleSaveUserName(u.fullId)}
                        disabled={savingUserName}
                        style={{ fontFamily: 'Inter, sans-serif', fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9a227', background: 'transparent', border: '1px solid rgba(201,162,39,0.3)', padding: '3px 8px', cursor: 'pointer', opacity: savingUserName ? 0.4 : 1 }}
                      >
                        {savingUserName ? '…' : 'OK'}
                      </button>
                      <button
                        onClick={() => setEditingUserId(null)}
                        style={{ fontFamily: 'Inter, sans-serif', fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6b6560', background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', padding: '3px 8px', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => { setEditingUserId(u.fullId); setEditingUserName(u.name) }}>
                      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '15px', color: '#e8e3d9' }}>{u.name}</span>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '8px', color: '#3d3a35', letterSpacing: '0.1em', textTransform: 'uppercase' }}>editar</span>
                    </div>
                  )}

                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#9e9890' }}>{u.email}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#9e9890', textAlign: 'center' }}>{u.orders}</span>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: '#c9a227' }}>${u.total}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6b6560' }}>{u.joined}</span>
                </div>
              ))}
            </div>
            </div>{/* /admin-table-wrap users */}
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {tab === 'analytics' && (() => {
          const filteredRevenue = period === '1m'
            ? revenueByMonth.slice(-1)
            : period === '3m'
            ? revenueByMonth.slice(-3)
            : revenueByMonth
          const filtMax = Math.max(...filteredRevenue.map(m => m.revenue), 0)
          const filtTotal = filteredRevenue.reduce((s, m) => s + m.revenue, 0)

          return (
            <div>
              {/* Export */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
                <button onClick={() => exportCSV(dbOrders)} style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.3)', color: '#c9a227', fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 20px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,162,39,0.16)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(201,162,39,0.08)' }}>
                  ↓ Exportar pedidos (CSV)
                </button>
              </div>

              {/* Ingresos por mes */}
              <div style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)', padding: '32px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <p style={{ ...label12, marginBottom: 0 }}>Ingresos por mes</p>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {([['all', 'Todo'], ['3m', '3 meses'], ['1m', 'Este mes']] as const).map(([val, lbl]) => (
                      <button key={val} onClick={() => setPeriod(val)} style={{ background: period === val ? 'rgba(201,162,39,0.12)' : 'transparent', border: `1px solid ${period === val ? 'rgba(201,162,39,0.4)' : 'rgba(255,255,255,0.06)'}`, color: period === val ? '#c9a227' : '#6b6560', fontFamily: 'Inter, sans-serif', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 12px', cursor: 'pointer', transition: 'all 0.2s' }}>{lbl}</button>
                    ))}
                  </div>
                </div>

                {filteredRevenue.length === 0 ? (
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#3d3a35', fontStyle: 'italic', textAlign: 'center', padding: '40px 0' }}>Sin ventas registradas aún</p>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '140px' }}>
                      {filteredRevenue.map(({ month, revenue }) => {
                        const isHovered = hoveredBar === month
                        return (
                          <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end', position: 'relative', cursor: 'pointer' }}
                            onMouseEnter={() => setHoveredBar(month)}
                            onMouseLeave={() => setHoveredBar(null)}>
                            {isHovered && (
                              <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', background: '#1a1a1a', border: '1px solid rgba(201,162,39,0.3)', padding: '8px 12px', marginBottom: '4px', whiteSpace: 'nowrap', zIndex: 10 }}>
                                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: '#c9a227' }}>${revenue}</div>
                                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: '#6b6560', letterSpacing: '0.1em' }}>{filtTotal > 0 ? ((revenue / filtTotal) * 100).toFixed(0) : 0}% del período</div>
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
                        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', color: '#c9a227' }}>
                          ${filteredRevenue.filter(m => m.revenue > 0).length > 0
                            ? (filtTotal / filteredRevenue.filter(m => m.revenue > 0).length).toFixed(0)
                            : 0}
                        </div>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', color: '#6b6560', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px' }}>Promedio mensual</div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Ventas por película */}
              <div style={{ background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.06)', padding: '32px', marginBottom: '24px' }}>
                <p style={label12}>Ventas por película</p>
                {localMovies.length === 0 ? (
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#3d3a35', fontStyle: 'italic' }}>Sin películas en catálogo</p>
                ) : (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 120px', gap: '16px', padding: '0 0 12px', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {['Película', 'Ventas', 'Ingresos', 'Ver / Desc.'].map(h => <span key={h} style={cell}>{h}</span>)}
                    </div>
                    {localMovies.map(m => {
                      const sales = movieSales[m.title] ?? { count: 0, revenue: 0 }
                      const watchCount = dbOrders.filter(o => o.movie === m.title && o.tier === 'watch').length
                      const dlCount = dbOrders.filter(o => o.movie === m.title && o.tier === 'download').length
                      return (
                        <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 120px', gap: '16px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '15px', color: '#e8e3d9' }}>{m.title}</span>
                            {m.featured && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9a227', border: '1px solid rgba(201,162,39,0.4)', padding: '2px 6px' }}>Destacada</span>}
                          </div>
                          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: sales.count > 0 ? '#c9a227' : '#3d3a35' }}>{sales.count}</span>
                          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', color: sales.revenue > 0 ? '#c9a227' : '#3d3a35' }}>${sales.revenue}</span>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#6b6560' }}>{watchCount} ver · {dlCount} desc.</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Películas más vendidas */}
              {topMovies.length > 0 && (
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
              )}
            </div>
          )
        })()}

        </>}

      </div>
    </div>
  )
}
