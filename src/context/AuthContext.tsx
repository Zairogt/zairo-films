import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'

// Cache del perfil en localStorage para restaurar la sesión instantáneamente al recargar
const PROFILE_KEY = 'zf_profile'

function readProfileCache(id: string): { name: string; isAdmin: boolean } | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    return p.id === id ? p : null  // Ignorar cache si es de otro usuario
  } catch { return null }
}

function writeProfileCache(id: string, name: string, isAdmin: boolean) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify({ id, name, isAdmin })) } catch {}
}

function clearProfileCache() {
  try { localStorage.removeItem(PROFILE_KEY) } catch {}
}

export type AccessTier = 'anon' | 'free' | 'watch' | 'download'

interface Purchase {
  movieId: string
  tier: 'watch' | 'download'
  date: string
  amount: number
}

interface AuthUser {
  id: string
  email: string
  name: string
  isAdmin: boolean
}

interface AuthCtx {
  user: AuthUser | null
  purchases: Purchase[]
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<{ needsConfirmation: boolean }>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  buyMovie: (movieId: string, tier: 'watch' | 'download', amount: number) => Promise<void>
  getAccess: (movieId: string) => AccessTier
}

const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 8000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            const { id, email, user_metadata } = session.user

            if (event === 'INITIAL_SESSION') {
              // Recarga: usar cache solo si el ID coincide exactamente
              const cached = readProfileCache(id)
              if (cached) {
                setUser({ id, email: email!, name: cached.name, isAdmin: cached.isAdmin })
                setLoading(false)
                // Validar perfil y compras en background (sin bloquear)
                loadUser(id, email!, user_metadata)
                clearTimeout(timeout)
                return
              }
              // Sin cache — cargar desde Supabase
              await loadUser(id, email!, user_metadata)
            } else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
              // Refresh silencioso — no borrar estado, solo actualizar en background
              loadUser(id, email!, user_metadata)
            } else {
              // SIGNED_IN: nuevo login — limpiar sesión previa para evitar
              // que quede visible la sesión de otro usuario
              setUser(null)
              setPurchases([])
              clearProfileCache()
              await loadUser(id, email!, user_metadata)
            }
          } else {
            setUser(null)
            setPurchases([])
            clearProfileCache()
            setLoading(false)
          }
        } finally {
          clearTimeout(timeout)
        }
      }
    )

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  async function loadUser(
    id: string,
    email: string,
    metadata: Record<string, unknown>
  ) {
    try {
      // Timeout de 5s por si Supabase no responde
      const abort = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 5000)
      )

      // Fetch perfil y compras en paralelo
      const [profileRes, purchasesRes] = await Promise.race([
        Promise.all([
          supabase.from('profiles').select('name, is_admin').eq('id', id).maybeSingle(),
          supabase.from('purchases').select('movie_id, tier, amount, created_at').eq('user_id', id),
        ]),
        abort as never,
      ])

      let name = (metadata?.full_name ?? metadata?.name ?? email.split('@')[0]) as string
      let isAdmin = false

      if (!profileRes.data) {
        // Crear perfil si no existe (trigger no corrió)
        const { data: created } = await supabase
          .from('profiles')
          .upsert({ id, name, email }, { onConflict: 'id' })
          .select('name, is_admin')
          .maybeSingle()
        name = created?.name ?? name
        isAdmin = created?.is_admin ?? false
      } else {
        name = profileRes.data.name ?? email.split('@')[0]
        isAdmin = profileRes.data.is_admin ?? false
      }

      setUser({ id, email, name, isAdmin })
      writeProfileCache(id, name, isAdmin)
      setPurchases(
        (purchasesRes.data ?? []).map(p => ({
          movieId: p.movie_id,
          tier: p.tier,
          date: p.created_at,
          amount: p.amount,
        }))
      )
    } catch {
      // Timeout o error — el usuario queda como no-admin
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signup = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })
    if (error) throw error
    return { needsConfirmation: !data.session }
  }

  const loginWithGoogle = async () => {
    // redirectTo debe ser el origin sin hash — con HashRouter el ?code=xxx de PKCE
    // quedaría dentro del hash y supabase-js no podría leerlo.
    // La Landing detecta el código y redirige a /catalogo automáticamente.
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setPurchases([])
    clearProfileCache()
  }

  const buyMovie = async (movieId: string, tier: 'watch' | 'download', amount: number) => {
    if (!user) throw new Error('No autenticado')
    const { error } = await supabase
      .from('purchases')
      .upsert(
        { user_id: user.id, movie_id: movieId, tier, amount },
        { onConflict: 'user_id,movie_id' }
      )
    if (error) throw error

    setPurchases(prev => {
      const existing = prev.findIndex(p => p.movieId === movieId)
      const fresh = { movieId, tier, date: new Date().toISOString(), amount }
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = fresh
        return updated
      }
      return [...prev, fresh]
    })
  }

  const getAccess = (movieId: string): AccessTier => {
    if (!user) return 'anon'
    const p = purchases.find(p => p.movieId === movieId)
    if (!p) return 'free'
    return p.tier
  }

  return (
    <AuthContext.Provider value={{
      user, purchases, loading,
      login, signup, loginWithGoogle, logout, buyMovie, getAccess,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
