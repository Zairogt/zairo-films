import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import GoogleButton from '../components/GoogleButton'
import { MOVIES } from '../data/movies'

const BG_MOVIE = MOVIES[1] // Aquí Me Quedo

export default function Signup() {
  const { signup, loginWithGoogle, user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [sentTo, setSentTo] = useState('')

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) { setError('Completa todos los campos.'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    setLoading(true); setError('')
    try {
      const result = await signup(email, password, name)
      if (result.needsConfirmation) {
        setSentTo(email)
        setEmailSent(true)
      } else {
        showToast(`Cuenta creada. ¡Bienvenido, ${name.split(' ')[0]}!`)
        navigate('/catalogo')
      }
    } catch {
      setError('Error al crear cuenta. Verifica que el correo no esté registrado.')
    } finally {
      setLoading(false)
    }
  }

  // Redirigir si ya hay sesión (ej: OAuth de Google)
  useEffect(() => { if (user) navigate('/catalogo') }, [user, navigate])

  const strengthColors = ['transparent', '#c0392b', '#c9a227', '#4caf50']
  const strengthLabels = ['', 'Débil', 'Media', 'Fuerte']

  if (emailSent) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080808', padding: '24px' }}>
        <div style={{ maxWidth: '460px', width: '100%', textAlign: 'center' }}>

          {/* Icono sobre */}
          <div style={{
            width: '72px', height: '72px', margin: '0 auto 32px',
            border: '1px solid rgba(201,162,39,0.3)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="m2 7 8.5 6a2 2 0 0 0 3 0L22 7"/>
            </svg>
          </div>

          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#c9a227' }}>
            Último paso
          </span>

          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 300, color: '#e8e3d9', marginTop: '12px', marginBottom: '16px', lineHeight: 1.1 }}>
            Confirma tu correo
          </h1>

          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 300, color: '#6b6560', lineHeight: 1.8, marginBottom: '8px' }}>
            Enviamos un enlace de confirmación a:
          </p>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: '#e8e3d9', marginBottom: '32px', letterSpacing: '0.02em' }}>
            {sentTo}
          </p>

          {/* Aviso de spam */}
          <div style={{
            background: 'rgba(201,162,39,0.05)',
            border: '1px solid rgba(201,162,39,0.15)',
            padding: '16px 20px',
            marginBottom: '32px',
            textAlign: 'left',
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                <path d="M12 9v4"/><path d="M12 17h.01"/>
              </svg>
              <div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#c9a227', fontWeight: 500, marginBottom: '4px', letterSpacing: '0.05em' }}>
                  ¿No ves el correo?
                </p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6b6560', lineHeight: 1.7 }}>
                  Revisa tu carpeta de <strong style={{ color: '#8a7a5a' }}>Spam</strong> o <strong style={{ color: '#8a7a5a' }}>Correo no deseado</strong>. A veces los filtros bloquean correos de nuevos servicios. El enlace expira en 24 horas.
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/login')}>
              Ya confirmé — Ingresar
            </button>
            <button
              style={{ background: 'transparent', border: 'none', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#3d3a35', cursor: 'pointer', letterSpacing: '0.05em', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#6b6560')}
              onMouseLeave={e => (e.currentTarget.style.color = '#3d3a35')}
              onClick={() => { setEmailSent(false); setEmail(''); setPassword(''); setName('') }}
            >
              Usar otro correo
            </button>
          </div>

          <div style={{ marginTop: '40px' }}>
            <Link to="/" style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#3d3a35', textDecoration: 'none', letterSpacing: '0.05em' }}>
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>

      {/* ── Panel izquierdo — visual ── */}
      <div className="hide-mobile" style={{
        flex: '1',
        position: 'relative',
        overflow: 'hidden',
        background: '#080808',
      }}>
        {/* Poster de fondo */}
        <img
          src={BG_MOVIE.poster_url}
          alt=""
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            filter: 'brightness(0.4) saturate(1.1)',
          }}
        />
        {/* Gradientes */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(8,8,8,0) 40%, #080808 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(8,8,8,0.9) 0%, transparent 50%)',
        }} />

        {/* Contenido sobre el poster */}
        <div style={{
          position: 'absolute', bottom: '48px', left: '48px', right: '48px',
        }}>
          <div style={{
            width: '36px', height: '1px',
            background: '#c9a227', marginBottom: '20px',
          }} />
          <p style={{
            fontFamily: 'Cormorant Garamond, serif',
            fontSize: 'clamp(18px, 2.5vw, 26px)',
            fontWeight: 300, fontStyle: 'italic',
            color: 'rgba(232,227,217,0.85)',
            lineHeight: 1.5, marginBottom: '16px',
          }}>
            "{BG_MOVIE.tagline}"
          </p>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: '11px',
            color: '#c9a227', letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}>
            {BG_MOVIE.title} · {BG_MOVIE.year}
          </p>
        </div>

        {/* Logo arriba izquierda */}
        <div style={{ position: 'absolute', top: '40px', left: '48px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 300, color: '#e8e3d9', letterSpacing: '0.3em', textTransform: 'uppercase' }}>ZAIRO</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '8px', fontWeight: 500, color: '#c9a227', letterSpacing: '0.45em', textTransform: 'uppercase', marginTop: '2px' }}>FILMS</div>
          </Link>
        </div>
      </div>

      {/* ── Panel derecho — formulario ── */}
      <div style={{
        width: '100%',
        maxWidth: '480px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'clamp(32px, 6vw, 64px)',
        background: '#080808',
        borderLeft: '1px solid rgba(255,255,255,0.04)',
      }}>
        {/* Logo móvil */}
        <div className="show-mobile" style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', fontWeight: 300, color: '#e8e3d9', letterSpacing: '0.3em', textTransform: 'uppercase' }}>ZAIRO</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '8px', color: '#c9a227', letterSpacing: '0.45em', textTransform: 'uppercase', marginTop: '4px' }}>FILMS</div>
          </Link>
        </div>

        <div className="anim">
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#c9a227' }}>
            Acceso gratuito
          </span>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 300, color: '#e8e3d9', marginTop: '10px', marginBottom: '6px', lineHeight: 1.1 }}>
            Crear cuenta
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6b6560', letterSpacing: '0.03em', marginBottom: '36px' }}>
            Disfruta el catálogo completo de Zairo Films
          </p>

          {/* Google */}
          <GoogleButton onClick={loginWithGoogle} label="Registrarse con Google" />

          {/* Separador */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#3d3a35', letterSpacing: '0.1em', textTransform: 'uppercase' }}>o con email</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Nombre */}
            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6b6560', display: 'block', marginBottom: '8px' }}>
                Nombre completo
              </label>
              <input
                className="input-field"
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={e => { setName(e.target.value); setError('') }}
                style={{ width: '100%' }}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6b6560', display: 'block', marginBottom: '8px' }}>
                Correo electrónico
              </label>
              <input
                className="input-field"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                style={{ width: '100%' }}
              />
            </div>

            {/* Contraseña con toggle + strength */}
            <div>
              <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6b6560', display: 'block', marginBottom: '8px' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input-field"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  style={{ width: '100%', paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '0', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none',
                    color: '#6b6560', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: '10px',
                    letterSpacing: '0.08em', padding: '0 4px',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#e8e3d9')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#6b6560')}
                >
                  {showPass ? 'OCULTAR' : 'VER'}
                </button>
              </div>

              {/* Barra de fortaleza */}
              {password.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{
                        flex: 1, height: '2px',
                        background: i <= passwordStrength ? strengthColors[passwordStrength] : 'rgba(255,255,255,0.08)',
                        transition: 'background 0.3s',
                      }} />
                    ))}
                  </div>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: strengthColors[passwordStrength], letterSpacing: '0.08em' }}>
                    {strengthLabels[passwordStrength]}
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div style={{ background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', padding: '10px 14px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#c0392b' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <span style={{ width: '12px', height: '12px', border: '1px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  Creando cuenta...
                </span>
              ) : 'Crear cuenta gratis'}
            </button>
          </form>

          <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6b6560' }}>
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" style={{ color: '#c9a227', textDecoration: 'none' }}>Ingresar</Link>
            </p>
            <Link to="/" style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#3d3a35', textDecoration: 'none', letterSpacing: '0.05em', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#6b6560')}
              onMouseLeave={e => (e.currentTarget.style.color = '#3d3a35')}>
              ← Volver
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
