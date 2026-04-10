import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import GoogleButton from '../components/GoogleButton'
import { MOVIES } from '../data/movies'

const BG_MOVIE = MOVIES[0] // Bajo el Sol de Septiembre

export default function Login() {
  const { login, loginWithGoogle, resetPasswordForEmail, user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Flujo de recuperación de contraseña
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotError, setForgotError] = useState('')

  // Mensaje de error si se llegó desde un link de reset expirado/inválido
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const resetError = params.get('reset_error')
    if (resetError) setError(resetError)
  }, [location.search])

  // Redirigir si ya hay sesión activa (ej: después de OAuth de Google)
  useEffect(() => { if (user) navigate('/catalogo') }, [user, navigate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Completa todos los campos.'); return }
    setLoading(true); setError('')
    try {
      await login(email, password)
      showToast(`Bienvenido de vuelta`)
      navigate('/catalogo')
    } catch {
      setError('Credenciales inválidas.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault()
    if (!forgotEmail) { setForgotError('Ingresa tu correo.'); return }
    setForgotLoading(true); setForgotError('')
    try {
      await resetPasswordForEmail(forgotEmail)
      setForgotSent(true)
    } catch {
      setForgotError('No se pudo enviar el correo. Verifica la dirección.')
    } finally {
      setForgotLoading(false)
    }
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
        {/* Gradiente sobre la imagen */}
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
          {forgotMode ? (
            /* ── Panel: recuperar contraseña ── */
            <>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#c9a227' }}>
                Recuperar acceso
              </span>
              <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 300, color: '#e8e3d9', marginTop: '10px', marginBottom: '6px', lineHeight: 1.1 }}>
                ¿Olvidaste tu contraseña?
              </h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6b6560', marginBottom: '36px', lineHeight: 1.7 }}>
                Te enviaremos un enlace para restablecerla.<br />
                <span style={{ color: '#3d3a35', fontSize: '11px' }}>
                  ⚠ El enlace abre la app directamente — asegúrate de revisar el email en el mismo dispositivo donde usas Zairo Films.
                </span>
              </p>

              {forgotSent ? (
                <div style={{ background: 'rgba(76,175,80,0.06)', border: '1px solid rgba(76,175,80,0.2)', padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', color: '#4caf50', marginBottom: '8px' }}>✓</div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#9e9890', lineHeight: 1.7 }}>
                    Enviamos el enlace a<br />
                    <strong style={{ color: '#e8e3d9' }}>{forgotEmail}</strong>
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#3d3a35', marginTop: '12px', lineHeight: 1.6 }}>
                    Revisa tu bandeja de entrada y spam.<br />El enlace expira en 1 hora.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6b6560', display: 'block', marginBottom: '8px' }}>
                      Correo electrónico
                    </label>
                    <input
                      className="input-field"
                      type="email"
                      placeholder="tu@email.com"
                      value={forgotEmail}
                      onChange={e => { setForgotEmail(e.target.value); setForgotError('') }}
                      style={{ width: '100%' }}
                      autoFocus
                    />
                  </div>

                  {forgotError && (
                    <div style={{ background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', padding: '10px 14px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#c0392b' }}>
                      {forgotError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={forgotLoading}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {forgotLoading ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        <span style={{ width: '12px', height: '12px', border: '1px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                        Enviando…
                      </span>
                    ) : 'Enviar enlace'}
                  </button>
                </form>
              )}

              <button
                onClick={() => { setForgotMode(false); setForgotSent(false); setForgotError('') }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginTop: '28px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#3d3a35', padding: 0, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#6b6560')}
                onMouseLeave={e => (e.currentTarget.style.color = '#3d3a35')}
              >
                ← Volver al login
              </button>
            </>
          ) : (
            /* ── Panel: login normal ── */
            <>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', fontWeight: 500, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#c9a227' }}>
                Bienvenido de vuelta
              </span>
              <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 300, color: '#e8e3d9', marginTop: '10px', marginBottom: '6px', lineHeight: 1.1 }}>
                Ingresar
              </h1>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6b6560', letterSpacing: '0.03em', marginBottom: '36px' }}>
                Accede al catálogo completo de Zairo Films
              </p>

              <GoogleButton onClick={loginWithGoogle} label="Continuar con Google" />

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '24px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#3d3a35', letterSpacing: '0.1em', textTransform: 'uppercase' }}>o con email</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6b6560' }}>
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => { setForgotMode(true); setForgotEmail(email) }}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '10px', color: '#3d3a35', padding: 0, transition: 'color 0.2s', letterSpacing: '0.05em' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#c9a227')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#3d3a35')}
                    >
                      ¿Olvidaste la tuya?
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="input-field"
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError('') }}
                      style={{ width: '100%', paddingRight: '48px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#6b6560', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '10px', letterSpacing: '0.08em', padding: '0 4px', transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#e8e3d9')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#6b6560')}
                    >
                      {showPass ? 'OCULTAR' : 'VER'}
                    </button>
                  </div>
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
                      Ingresando...
                    </span>
                  ) : 'Ingresar'}
                </button>
              </form>

              <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#6b6560' }}>
                  ¿No tienes cuenta?{' '}
                  <Link to="/signup" style={{ color: '#c9a227', textDecoration: 'none' }}>Registrarse</Link>
                </p>
                <Link to="/" style={{ fontFamily: 'Inter, sans-serif', fontSize: '11px', color: '#3d3a35', textDecoration: 'none', letterSpacing: '0.05em', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#6b6560')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#3d3a35')}>
                  ← Volver
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
