import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'

// Cache del perfil en localStorage para restaurar la sesión instantáneamente al recargar
const PROFILE_KEY = 'zf_profile'

function readProfileCache(id: string): { name: string; isAdmin: boolean; nameUpdatedAt: string | null } | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    return p.id === id ? p : null
  } catch { return null }
}

function writeProfileCache(id: string, name: string, isAdmin: boolean, nameUpdatedAt: string | null) {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify({ id, name, isAdmin, nameUpdatedAt })) } catch {}
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
  nameUpdatedAt: string | null
}

interface AuthCtx {
  user: AuthUser | null
  purchases: Purchase[]
  loading: boolean
  recoveryMode: boolean
  clearRecoveryMode: () => void
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<{ needsConfirmation: boolean }>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  resetPasswordForEmail: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  updateName: (name: string) => Promise<void>
  buyMovie: (movieId: string, tier: 'watch' | 'download', amount: number) => Promise<void>
  getAccess: (movieId: string) => AccessTier
}

const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  // recoveryMode: true cuando Supabase redirige desde un link de reset de contraseña.
  // Un componente en App.tsx lo observa y navega a /reset-password.
  const [recoveryMode, setRecoveryMode] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 8000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            const { id, email, user_metadata } = session.user

            if (event === 'INITIAL_SESSION') {
              const cached = readProfileCache(id)
              if (cached) {
                setUser({ id, email: email!, name: cached.name, isAdmin: cached.isAdmin, nameUpdatedAt: cached.nameUpdatedAt })
                setLoading(false)
                loadUser(id, email!, user_metadata)
                clearTimeout(timeout)
                return
              }
              await loadUser(id, email!, user_metadata)
            } else if (event === 'PASSWORD_RECOVERY') {
              // El usuario llegó desde el link del email de reset.
              // IMPORTANTE con HashRouter: redirectTo debe ser window.location.origin (sin hash),
              // igual que OAuth, para que supabase-js pueda leer el token de la URL.
              // Cargamos el usuario y activamos recoveryMode — App.tsx redirigirá a /reset-password.
              await loadUser(id, email!, user_metadata)
              setRecoveryMode(true)
            } else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
              // Refresh silencioso — no borrar estado
              loadUser(id, email!, user_metadata)
            } else {
              // SIGNED_IN: nuevo login — limpiar sesión previa
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
      const abort = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 5000)
      )

      const [profileRes, purchasesRes] = await Promise.race([
        Promise.all([
          supabase.from('profiles').select('name, is_admin, name_updated_at').eq('id', id).maybeSingle() as any,
          supabase.from('purchases').select('movie_id, tier, amount, created_at').eq('user_id', id),
        ]),
        abort as never,
      ])

      let name = (metadata?.full_name ?? metadata?.name ?? email.split('@')[0]) as string
      let isAdmin = false
      let nameUpdatedAt: string | null = null

      if (!profileRes.data) {
        const res: any = await supabase
          .from('profiles')
          .upsert({ id, name, email }, { onConflict: 'id' })
          .select('name, is_admin, name_updated_at')
          .maybeSingle()
        const created = res.data
        name = created?.name ?? name
        isAdmin = created?.is_admin ?? false
        nameUpdatedAt = created?.name_updated_at ?? null
      } else {
        const p = profileRes.data as { name: string; is_admin: boolean; name_updated_at: string | null }
        name = p.name ?? email.split('@')[0]
        isAdmin = p.is_admin ?? false
        nameUpdatedAt = p.name_updated_at ?? null
      }

      setUser({ id, email, name, isAdmin, nameUpdatedAt })
      writeProfileCache(id, name, isAdmin, nameUpdatedAt)
      setPurchases(
        (purchasesRes.data ?? []).map(p => ({
          movieId: p.movie_id,
          tier: p.tier,
          date: p.created_at,
          amount: p.amount,
        }))
      )
    } catch {
      // Timeout o error de red
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
    // redirectTo = origin limpio (sin hash) — con HashRouter el ?code= de PKCE
    // quedaría dentro del hash y supabase-js no podría leerlo.
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
  }

  const resetPasswordForEmail = async (email: string) => {
    // Mismo patrón que OAuth: redirectTo = origin sin hash.
    // Supabase añade ?token_hash=...&type=recovery como query params,
    // que son accesibles aunque la app use HashRouter.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })
    if (error) throw error
  }

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  }

  const updateName = async (name: string) => {
    if (!user) throw new Error('No autenticado')
    const now = new Date().toISOString()
    const { error } = await (supabase
      .from('profiles')
      .update({ name, name_updated_at: now } as any)
      .eq('id', user.id))
    if (error) throw error
    setUser(prev => prev ? { ...prev, name, nameUpdatedAt: now } : prev)
    writeProfileCache(user.id, name, user.isAdmin, now)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setPurchases([])
    clearProfileCache()
    setRecoveryMode(false)
  }

  const clearRecoveryMode = () => setRecoveryMode(false)

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
      recoveryMode, clearRecoveryMode,
      login, signup, loginWithGoogle, logout,
      resetPasswordForEmail, updatePassword, updateName,
      buyMovie, getAccess,
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
