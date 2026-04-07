import { useState, useCallback } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import GoogleButton from '../components/GoogleButton'

export default function Signup() {
  const { signup, loginWithGoogle } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) { setError('Completa todos los campos.'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    setLoading(true); setError('')
    try {
      await signup(email, password, name)
      showToast(`Cuenta creada. ¡Bienvenido, ${name.split(' ')[0]}!`)
      navigate('/catalogo')
    } catch {
      setError('Error al crear cuenta.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = useCallback((profile: { email: string; name: string; picture: string; sub: string }) => {
    loginWithGoogle(profile)
    showToast(`Bienvenido, ${profile.name.split(' ')[0]}`)
    navigate('/catalogo')
  }, [loginWithGoogle, showToast, navigate])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 0%, #1a1208 0%, #080808 60%)',
    }}>
      <div className="anim" style={{ width: '100%', maxWidth: '400px', padding: '0 24px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: 300, color: '#e8e3d9', letterSpacing: '0.3em', textTransform: 'uppercase' }}>ZAIRO</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '9px', fontWeight: 500, color: '#c9a227', letterSpacing: '0.45em', textTransform: 'uppercase', marginTop: '4px' }}>FILMS</div>
          </Link>
        </div>

        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', fontWeight: 300, color: '#e8e3d9', textAlign: 'center', marginBottom: '8px' }}>
          Crear cuenta
        </h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6b6560', textAlign: 'center', letterSpacing: '0.05em', marginBottom: '36px' }}>
          Acceso gratuito al catálogo con anuncios
        </p>

        {/* Google button */}
        <GoogleButton onSuccess={handleGoogle} label="Registrarse con Google" />

        {/* Separador */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#3d3a35', letterSpacing: '0.1em', textTransform: 'uppercase' }}>o con email</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <input className="input-field" type="text" placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} />
          <input className="input-field" type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="input-field" type="password" placeholder="Contraseña (mín. 6 caracteres)" value={password} onChange={e => setPassword(e.target.value)} />

          {error && <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#c0392b' }}>{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
          </button>
        </form>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6b6560', textAlign: 'center', marginTop: '28px' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#c9a227', textDecoration: 'none' }}>Ingresar</Link>
        </p>
      </div>
    </div>
  )
}
