import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

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
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  loginWithGoogle: (profile: { email: string; name: string; picture: string; sub: string }) => void
  logout: () => void
  buyMovie: (movieId: string, tier: 'watch' | 'download', amount: number) => void
  getAccess: (movieId: string) => AccessTier
}

const AuthContext = createContext<AuthCtx | null>(null)

const ADMIN_EMAIL = 'admin@zairofilms.com'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('zf_user')
    return stored ? JSON.parse(stored) : null
  })
  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const stored = localStorage.getItem('zf_purchases')
    return stored ? JSON.parse(stored) : []
  })

  useEffect(() => {
    if (user) localStorage.setItem('zf_user', JSON.stringify(user))
    else localStorage.removeItem('zf_user')
  }, [user])

  useEffect(() => {
    localStorage.setItem('zf_purchases', JSON.stringify(purchases))
  }, [purchases])

  const login = async (email: string, _password: string) => {
    // Demo: any password works
    await new Promise(r => setTimeout(r, 800))
    const u: AuthUser = {
      id: Math.random().toString(36).slice(2),
      email,
      name: email.split('@')[0],
      isAdmin: email === ADMIN_EMAIL,
    }
    setUser(u)
  }

  const signup = async (email: string, _password: string, name: string) => {
    await new Promise(r => setTimeout(r, 900))
    const u: AuthUser = {
      id: Math.random().toString(36).slice(2),
      email,
      name,
      isAdmin: false,
    }
    setUser(u)
  }

  const loginWithGoogle = (profile: { email: string; name: string; picture: string; sub: string }) => {
    const u: AuthUser = {
      id: profile.sub,
      email: profile.email,
      name: profile.name.split(' ')[0],
      isAdmin: profile.email === ADMIN_EMAIL,
    }
    setUser(u)
  }

  const logout = () => {
    setUser(null)
    setPurchases([])
  }

  const buyMovie = (movieId: string, tier: 'watch' | 'download', amount: number) => {
    setPurchases(prev => {
      const existing = prev.findIndex(p => p.movieId === movieId)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = { movieId, tier, date: new Date().toISOString(), amount }
        return updated
      }
      return [...prev, { movieId, tier, date: new Date().toISOString(), amount }]
    })
  }

  const getAccess = (movieId: string): AccessTier => {
    if (!user) return 'anon'
    const p = purchases.find(p => p.movieId === movieId)
    if (!p) return 'free'
    return p.tier
  }

  return (
    <AuthContext.Provider value={{ user, purchases, login, signup, loginWithGoogle, logout, buyMovie, getAccess }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
