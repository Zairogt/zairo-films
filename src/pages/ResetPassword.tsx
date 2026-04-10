import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function ResetPassword() {
  const { updatePassword, clearRecoveryMode } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const strengthColors = ['transparent', '#c0392b', '#c9a227', '#4caf50']
  const strengthLabels = ['', 'Débil', 'Media', 'Fuerte']

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < 6) { setError('Mínimo 6 caracteres.'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }
    setLoading(true); setError('')
    try {
      await updatePassword(password)
      clearRecoveryMode()
      setDone(true)
      showToast('Contraseña actualizada correctamente')
    } catch {
      setError('No se pudo actualizar la contraseña. El enlace puede haber expirado.')
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#080808', padding: '24px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          border: '1px solid rgba(201,162,39,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 32px', background: 'rgba(201,162,39,0.06)',
        }}>
          <span style={{ fontSize: '28px', color: '#c9a227' }}>✓</span>
        </div>
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '36px', fontWeight: 300, color: '#e8e3d9', marginBottom: '12px',
        }}>Contraseña actualizada</h1>
        <div style={{ width: '36px', height: '1px', background: '#c9a227', margin: '0 auto 20px' }} />
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: '13px',
          color: '#6b6560', lineHeight: 1.7, marginBottom: '36px',
        }}>
          Tu contraseña ha sido cambiada exitosamente.<br />Ya puedes acceder con tus nuevas credenciales.
        </p>
        <button className="btn-primary" onClick={() => navigate('/catalogo')}>
          Ir al catálogo
        </button>
      </div>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#080808', padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            fontFamily: 'Cormorant Garamond, serif', fontSize: '24px',
            fontWeight: 300, color: '#e8e3d9', letterSpacing: '0.3em', textTransform: 'uppercase',
          }}>ZAIRO</div>
          <div style={{
            fontFamily: 'Inter, sans-serif', fontSize: '8px',
            color: '#c9a227', letterSpacing: '0.45em', textTransform: 'uppercase', marginTop: '4px',
          }}>FILMS</div>
        </div>

        <span style={{
          fontFamily: 'Inter, sans-serif', fontSize: '10px',
          fontWeight: 500, letterSpacing: '0.25em',
          textTransform: 'uppercase', color: '#c9a227',
        }}>Nueva contraseña</span>
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '36px', fontWeight: 300, color: '#e8e3d9',
          margin: '10px 0 6px', lineHeight: 1.1,
        }}>
          Restablecer acceso
        </h1>
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: '12px',
          color: '#6b6560', marginBottom: '36px',
        }}>
          Elige una contraseña segura para tu cuenta.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Nueva contraseña */}
          <div>
            <label style={{
              fontFamily: 'Inter, sans-serif', fontSize: '10px',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: '#6b6560', display: 'block', marginBottom: '8px',
            }}>Nueva contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input-field"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                style={{ width: '100%', paddingRight: '56px' }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: 0, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none',
                  color: '#6b6560', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: '10px',
                  letterSpacing: '0.08em', padding: '0 4px', transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#e8e3d9')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6b6560')}
              >
                {showPass ? 'OCULTAR' : 'VER'}
              </button>
            </div>

            {/* Indicador de fortaleza */}
            {password.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{
                      flex: 1, height: '2px', borderRadius: '1px',
                      background: strength >= i ? strengthColors[strength] : 'rgba(255,255,255,0.08)',
                      transition: 'background 0.2s',
                    }} />
                  ))}
                </div>
                <span style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '10px',
                  color: strengthColors[strength], letterSpacing: '0.05em',
                }}>
                  {strengthLabels[strength]}
                </span>
              </div>
            )}
          </div>

          {/* Confirmar */}
          <div>
            <label style={{
              fontFamily: 'Inter, sans-serif', fontSize: '10px',
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: '#6b6560', display: 'block', marginBottom: '8px',
            }}>Confirmar contraseña</label>
            <input
              className="input-field"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setError('') }}
              style={{
                width: '100%',
                borderBottomColor: confirm.length > 0
                  ? confirm === password ? 'rgba(76,175,80,0.5)' : 'rgba(192,57,43,0.5)'
                  : undefined,
              }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)',
              padding: '10px 14px',
              fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#c0392b',
            }}>
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
                <span style={{
                  width: '12px', height: '12px',
                  border: '1px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                  borderRadius: '50%', display: 'inline-block',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Guardando…
              </span>
            ) : 'Guardar nueva contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
